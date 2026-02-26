import { createServerFn } from "@tanstack/react-start";
import { UserRole } from "common";
import z from "zod";
import { authMiddleware } from "../middleware/authMiddleware";
import { getServerAuth, getServerDB } from "@/lib/firebase.server";
import type { UserProfile } from "common";

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
    const { authUser } = context;
    const isPrivileged =
      authUser.role === UserRole.VOLUNTEER || authUser.role === UserRole.ADMIN;

    if (!isPrivileged && authUser.uid !== uid) {
      throw new Error("You can only fetch your own user profile");
    }

    const db = getServerDB();
    const userDoc = await db.users.doc(uid).get();

    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const profileData = userDoc.data();
    if (!profileData) {
      throw new Error("User not found");
    }

    return { ...profileData, id: userDoc.id } as UserProfile;
  });

/**
 * Returns a list of all user profiles.
 * Only admins and volunteers may call this.
 */
export const getAllUserProfiles = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { authUser } = context;
    const isPrivileged =
      authUser.role === UserRole.ADMIN || authUser.role === UserRole.VOLUNTEER;

    if (!isPrivileged) {
      throw new Error("Only admins and volunteers may list all user profiles");
    }

    const db = getServerDB();
    const snapshot = await db.users.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return { ...data, id: doc.id } as UserProfile;
    });
  });

const updateUserProfileSchema = z.object({
  userId: z.string().min(1),
  updates: z
    .object({
      firstName: z.string().trim().min(1).optional(),
      lastName: z.string().trim().min(1).optional(),
      phone: z.string().trim().min(1).optional(),
    })
    .strict()
    .refine((u) => Object.keys(u).length > 0, {
      message: "At least one update field is required",
    }),
});

/**
 * Updates a user's profile details (first name, last name, phone).
 * - Admins may update any user.
 * - Non-admins may only update their own profile.
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

    const isAdmin = authUser.role === UserRole.ADMIN;
    if (!isAdmin && authUser.uid !== userId) {
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

    const nextProfile: UserProfile = {
      ...currentProfile,
      ...(updates.firstName !== undefined ? { firstName: updates.firstName } : {}),
      ...(updates.lastName !== undefined ? { lastName: updates.lastName } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
      id: userSnap.id,
    };

    const authPatch: Parameters<typeof auth.updateUser>[1] = {};
    if (updates.phone !== undefined) authPatch.phoneNumber = updates.phone;
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      authPatch.displayName = `${nextProfile.firstName} ${nextProfile.lastName}`.trim();
    }

    // Two-phase update with best-effort rollback to reduce drift.
    try {
      if (Object.keys(authPatch).length > 0) {
        await auth.updateUser(userId, authPatch);
      }
    } catch (err) {
      throw new Error("Failed to update Firebase Auth user");
    }

    try {
      await userRef.update({
        ...(updates.firstName !== undefined ? { firstName: updates.firstName } : {}),
        ...(updates.lastName !== undefined ? { lastName: updates.lastName } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
      });
    } catch (err) {
      // rollback auth best-effort
      const rollbackPatch: Parameters<typeof auth.updateUser>[1] = {};
      rollbackPatch.displayName = authRecord.displayName ?? undefined;
      rollbackPatch.phoneNumber = authRecord.phoneNumber ?? undefined;
      try {
        await auth.updateUser(userId, rollbackPatch);
      } catch {
        // ignore rollback failure; we'll still surface Firestore failure
      }
      throw new Error("Failed to update user profile");
    }

    return nextProfile;
  });

const deleteUserProfileSchema = z.object({
  userId: z.string().min(1),
});

/**
 * Deletes a user profile (Firestore + Firebase Auth).
 * Only accessible to admins.
 */
export const deleteUserProfile = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(deleteUserProfileSchema)
  .handler(async ({ data, context }) => {
    if (context.authUser.role !== UserRole.ADMIN) {
      throw new Error("Only admins can delete user profiles");
    }

    const { userId } = data;
    const db = getServerDB();
    const auth = getServerAuth();

    const errors: Array<string> = [];

    try {
      await db.users.doc(userId).delete();
    } catch {
      errors.push("Firestore user profile");
    }

    try {
      await auth.deleteUser(userId);
    } catch {
      errors.push("Firebase Auth user");
    }

    if (errors.length > 0) {
      throw new Error(`Failed to delete: ${errors.join(", ")}`);
    }
  });
