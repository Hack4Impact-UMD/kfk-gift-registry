import type { auth as adminAuth } from "firebase-admin";
import type { UserProfile } from "../common/src/index.ts";

export const DEFAULT_PASSWORD = "Password123!";

async function upsertAuthUser(
  auth: adminAuth.Auth,
  user: UserProfile,
): Promise<void> {
  const record = {
    uid: user.id,
    email: user.email,
    displayName: user.name,
    phoneNumber: user.phone ?? undefined,
    disabled: !user.enabled,
    password: DEFAULT_PASSWORD,
  };

  try {
    await auth.createUser(record);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      "errorInfo" in err &&
      (err as { errorInfo: { code: string } }).errorInfo.code ===
        "auth/uid-already-exists"
    ) {
      await auth.updateUser(user.id, record);
    } else {
      throw err;
    }
  }

  await auth.setCustomUserClaims(user.id, { role: user.role });
}

/** Creates (or updates) a Firebase Auth account for every seeded user. */
export async function seedAuthUsers(
  auth: adminAuth.Auth,
  users: Array<UserProfile>,
) {
  await Promise.all(users.map((user) => upsertAuthUser(auth, user)));
}
