import { createServerFn } from "@tanstack/react-start";
import { UserRole } from "common";
import z from "zod";
import {
  authMiddleware,
  requireRolesMiddleware,
} from "@/server/middleware/authMiddleware";
import { getServerAuth, getServerDB } from "@/lib/firebase.server";
import { DateTime } from "luxon";

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
    if (uid === context.authUser.uid || context.authUser.role === UserRole.VOLUNTEER) {
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

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return data;
    });
  });

const updateUserProfileSchema = z.object({
  userId: z.string().min(1),
  updates: z
    .object({
      firstName: z.string().trim().min(1),
      lastName: z.string().trim().min(1),
      phone: z.string().trim().min(1),
    })
    .partial()
    .strict()
    .refine((u) => Object.keys(u).length > 0, {
      message: "At least one update field is required",
    }),
});

/**
 * Updates a user's profile details (first name, last name, phone).
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
      const displayName = `${updates.firstName ?? currentProfile.firstName} ${updates.lastName ?? currentProfile.lastName}`;
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
  inviteId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
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

const staffInviteSchema = z.object({
  id: z.string(),
  sentBy: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.VOLUNTEER]),
  createdAt: z.string(),
  used: z.boolean(),
}); // validates firestore invite doc

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

    const invite = staffInviteSchema.parse(inviteSnap.data());

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

    // validation succesful, so auth creation is now safe
    const userEmail = invite.email;
    const authUser = await auth.createUser({
      displayName: `${cleaned.firstName} ${cleaned.lastName}`,
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
      firstName: cleaned.firstName,
      lastName: cleaned.lastName,
      role: invite.role,
      phone: cleaned.phone,
      createdAt: DateTime.now().toISO(),
      enabled: true,
    };

    await db.users.doc(authUser.uid).set(userDoc);
    await db.invites.doc(cleaned.inviteId).update({ used: true });

    return userDoc;
  });
