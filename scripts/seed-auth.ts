/**
 * Creates Firebase Auth accounts for every user in the seed JSON.
 * Reads the seed JSON from stdin (piped from seed.ts).
 * Only intended for the local emulator — never run against production.
 *
 * Default password for all seeded accounts: Password123!
 */

import admin from "firebase-admin";
import type { UserProfile } from "../common/src/index.ts";
import { DEFAULT_PASSWORD, seedAuthUsers } from "./seed-auth-users.ts";

const AUTH_EMULATOR_HOST = "localhost:9099";
const PROJECT_ID = "kfk-gift-registry";

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

async function main() {
  const raw = await readStdin();
  const data = JSON.parse(raw) as { users: Array<UserProfile> };
  const users = data.users;

  console.log(`Creating/updating ${users.length} auth accounts...`);

  await seedAuthUsers(auth, users);

  console.log(`Auth accounts ready. Default password: ${DEFAULT_PASSWORD}`);
}

main().catch((err) => {
  console.error("seed-auth failed:", err);
  process.exit(1);
});
