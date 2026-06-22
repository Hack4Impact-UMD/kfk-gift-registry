/**
 * Creates Firebase Auth accounts for every user in the seed JSON.
 * Reads the seed JSON from stdin (piped from seed.ts).
 * Only intended for the local emulator — never run against production.
 *
 * Default password for all seeded accounts: Password123!
 */

import admin from "firebase-admin";
import type { UserProfile } from "../common/src/index.ts";

const AUTH_EMULATOR_HOST = "localhost:9099";
const PROJECT_ID = "kfk-gift-registry";
const DEFAULT_PASSWORD = "Password123!";

process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR_HOST;

admin.initializeApp({ projectId: PROJECT_ID });
const auth = admin.auth();

async function readStdin(): Promise<string> {
  const chunks: Array<Buffer> = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function upsertAuthUser(user: UserProfile): Promise<void> {
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

async function main() {
  const raw = await readStdin();
  const data = JSON.parse(raw) as { users: Array<UserProfile> };
  const users = data.users;

  console.log(`Creating/updating ${users.length} auth accounts...`);

  await Promise.all(users.map(upsertAuthUser));

  console.log(`Auth accounts ready. Default password: ${DEFAULT_PASSWORD}`);
}

main().catch((err) => {
  console.error("seed-auth failed:", err);
  process.exit(1);
});
