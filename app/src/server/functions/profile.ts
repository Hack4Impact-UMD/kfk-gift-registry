import { createServerFn } from "@tanstack/react-start";
import { UserRole, UserProfileSchema } from "common";
import z from "zod";
import { DateTime } from "luxon";
import {
  authMiddleware,
  requireRolesMiddleware,
} from "@/server/middleware/authMiddleware";
import { getServerAuth, getServerDB } from "@/lib/firebase.server";

const uidSchema = z.object({ uid: z.string().min(1) });

/**
 * Returns the UserProfile for the given user ID.
 * - Non-volunteer/admin: can only fetch their own profile.
 * - Volunteer/admin: can fetch any user's profile.
 * - Requires authentication.
 */
export const getUserProfileById = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator(uidSchema)
  .handler(async ({ data, context }) => {
    const uid = data.uid;
    if (
      uid === context.authUser.uid ||
      [UserRole.ADMIN, UserRole.VOLUNTEER, UserRole.DIRECTOR].includes(
        context.authUser.role,
      )
    ) {
      const db = getServerDB();
      const userDoc = await db.users.doc(uid).get();

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const profileData = userDoc.data();
      if (!profileData) {
        throw new Error("User not found");
      }

      return profileData;
    } else {
      throw new Error("Not authorized");
    }
  });

/**
 * Returns a list of all user profiles.
 * Only admins and volunteers may call this.
 */
export const getAllUserProfiles = createServerFn({
  method: "GET",
})
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.VOLUNTEER,
      UserRole.DIRECTOR,
    ]),
  ])
  .handler(async () => {
    const db = getServerDB();
    const snapshot = await db.users.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return data;
    });
  });

const updateUserProfileSchema = z.object({
  userId: z.string().min(1),
  updates: UserProfileSchema.pick({ name: true, phone: true })
    .partial()
    .refine((u) => Object.keys(u).length > 0, {
      message: "At least one update field is required",
    }),
});

/**
 * Updates a user's profile details (name, phone).
 * - Directors may update any user.
 * - Non - directors may only update their own profile.
 * Syncs updates to both Firestore `users` and Firebase Auth user record.
 */
export const updateUserProfile = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(updateUserProfileSchema)
  .handler(async ({ data, context }) => {
    const { userId, updates } = data;
    const { authUser } = context;

    const isDirector = authUser.role === UserRole.DIRECTOR;
    if (!isDirector && authUser.uid !== userId) {
      throw new Error("You can only update your own user profile");
    }

    const db = getServerDB();
    const auth = getServerAuth();

    const userRef = db.users.doc(userId);
    const [userSnap, authRecord] = await Promise.all([
      userRef.get(),
      auth.getUser(userId),
    ]);

    if (!userSnap.exists) throw new Error("User not found");
    const currentProfile = userSnap.data();
    if (!currentProfile) throw new Error("User not found");

    try {
      const displayName = updates.name ?? currentProfile.name;
      await auth.updateUser(userId, {
        displayName,
        phoneNumber: updates.phone,
      });

      await db.users.doc(userId).update({
        ...updates,
      });
    } catch (err) {
      await db.users.doc(userId).set(currentProfile);
      await auth.updateUser(userId, {
        displayName: authRecord.displayName,
        phoneNumber: authRecord.phoneNumber,
      });

      throw new Error("Update failed");
    }

    return (await db.users.doc(userId).get()).data();
  });

const deleteUserProfileSchema = z.object({
  userId: z.string().min(1),
});

/**
 * Deletes a user profile(Firestore + Firebase Auth).
 * Only accessible to admins.
 */
export const deleteUserProfile = createServerFn({
  method: "POST",
})
  .middleware([requireRolesMiddleware([UserRole.DIRECTOR])])
  .inputValidator(deleteUserProfileSchema)
  .handler(async ({ data, context }) => {
    const { userId } = data;

    if (context.authUser.uid === userId) {
      throw new Error("Directors cannot delete their own account");
    }

    const db = getServerDB();
    const auth = getServerAuth();

    const errors: Array<string> = [];

    try {
      await auth.deleteUser(userId);
    } catch {
      errors.push("Firebase Auth user");
    }

    try {
      await db.users.doc(userId).delete();
    } catch {
      errors.push("Firestore user profile");
    }

    if (errors.length > 0) {
      throw new Error(`Failed to delete: ${errors.join(", ")}`);
    }
  });

const relevantStaffFields = z.object({
  inviteId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z
    .string()
    // this is interesting. after testing with a mock register form,
    // firebase auth expects the phone number in E.164 format (originally not accounted)
    // for in this zod. so i'm adding this in order to not produce any misconfigs between firestore and auth
    .regex(/^\+[1-9]\d{1,14}$/, {
      message: "Phone must be in E.164 format (e.g. +12223334444)",
    })
    .optional(),
});

export const registerStaffMemberWithInvite = createServerFn({ method: "POST" })
  .inputValidator(relevantStaffFields)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const auth = getServerAuth();

    // makes sure request input is valid
    const cleaned = relevantStaffFields.parse(data);
    const inviteSnap = await db.invites.doc(cleaned.inviteId).get();
    if (!inviteSnap.exists) {
      throw new Error("Invite not found");
    }

    const invite = inviteSnap.data();
    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.used) {
      throw new Error("Invite already used");
    }

    const dateCreated = DateTime.fromISO(invite.createdAt);
    if (!dateCreated.isValid) {
      throw new Error("Invalid invite createdAt");
    }
    const expired = dateCreated < DateTime.now().minus({ days: 7 });
    if (expired) {
      throw new Error("Invite not created in past 7 days");
    }

    // minimal race fix: atomically reserve the invite before creating Auth user
    const inviteRef = db.invites.doc(cleaned.inviteId);
    await db._instance.runTransaction(async (tx) => {
      const snap = await tx.get(inviteRef);
      if (!snap.exists) throw new Error("Invite not found");
      const latest = snap.data();
      if (!latest) throw new Error("Invite not found");
      if (latest.used) throw new Error("Invite already used");
      tx.update(inviteRef, { used: true });
    });
    // end minimal race fix

    // validation succesful, so auth creation is now safe
    const userEmail = invite.email;
    let authUser: { uid: string } | null = null;

    try {
      authUser = await auth.createUser({
        displayName: cleaned.name,
        email: userEmail,
        password: cleaned.password,
        phoneNumber: cleaned.phone,
      });

      await auth.setCustomUserClaims(authUser.uid, {
        role: invite.role,
      });

      // creates the user profile doc with the same ID as the Auth user
      const userDoc = {
        id: authUser.uid,
        email: userEmail,
        name: cleaned.name,
        role: invite.role,
        phone: cleaned.phone,
        createdAt: DateTime.now().toISO(),
        enabled: true,
      };

      await db.users.doc(authUser.uid).set(userDoc);

      return userDoc;
    } catch (err) {
      // best-effort cleanup: delete auth user and unlock invite
      if (authUser) {
        try {
          await auth.deleteUser(authUser.uid);
        } catch (e) {
          console.error("Failed to delete Auth user during rollback", e);
        }
      }
      try {
        await inviteRef.update({ used: false });
      } catch (e) {
        console.error("Failed to revert invite.used during rollback", e);
      }

      throw err instanceof Error ? err : new Error("Registration failed");
    }
  });

const donorRegistrationSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, {
      message: "Phone must be in E.164 format (e.g. +12223334444)",
    })
    .optional(),
});

export const registerDonor = createServerFn({ method: "POST" })
  .inputValidator(donorRegistrationSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const auth = getServerAuth();

    const cleaned = donorRegistrationSchema.parse(data);

    let authUser: { uid: string } | null = null;

    try {
      authUser = await auth.createUser({
        displayName: cleaned.name,
        email: cleaned.email,
        password: cleaned.password,
        phoneNumber: cleaned.phone,
      });

      await auth.setCustomUserClaims(authUser.uid, {
        role: UserRole.DONOR,
      });

      const userDoc = {
        id: authUser.uid,
        email: cleaned.email,
        name: cleaned.name,
        role: UserRole.DONOR,
        phone: cleaned.phone,
        createdAt: DateTime.now().toISO(),
        enabled: true,
      };

      await db.users.doc(authUser.uid).set(userDoc);

      return userDoc;
    } catch (err) {
      if (authUser) {
        try {
          await auth.deleteUser(authUser.uid);
        } catch (e) {
          console.error("Failed to delete Auth user during rollback", e);
        }
      }

      throw err instanceof Error ? err : new Error("Registration failed");
    }
  });

export const getCurrentUserProfile = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = getServerDB();
    const userDoc = await db.users.doc(context.authUser.uid).get();

    if (!userDoc.exists) throw new Error("User not found");

    return userDoc.data()!;
  });
