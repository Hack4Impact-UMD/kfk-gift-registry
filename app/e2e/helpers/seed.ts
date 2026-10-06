import { generateSeedData } from "../../../scripts/seed-data.ts";
import {
  DEFAULT_PASSWORD,
  seedAuthUsers,
} from "../../../scripts/seed-auth-users.ts";
import { PROJECT_ID, app } from "./auth";
import type { SeedData } from "../../../scripts/seed-data.ts";
import type { TestUser } from "./auth";

export type { SeedData };

const db = app.firestore();

// seed data key -> firestore collection
const COLLECTIONS = {
  giftDrives: "gift-drives",
  formLinks: "form-links",
  users: "users",
  invites: "invites",
  families: "families",
  familyLinks: "family-links",
  children: "children",
  gifts: "gifts",
  claims: "claims",
} as const satisfies Record<keyof SeedData, string>;

/** Wipes all Firestore docs, Auth accounts, and Storage objects. */
export async function resetEmulators() {
  const responses = await Promise.all([
    fetch(
      `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
      { method: "DELETE" },
    ),
    fetch(
      `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`,
      { method: "DELETE" },
    ),
  ]);
  for (const res of responses) {
    if (!res.ok) throw new Error(`emulator reset failed: ${res.status}`);
  }
  await app.storage().bucket().deleteFiles();
}

/**
 * Resets the emulators and writes the deterministic seed. Returns the seed so
 * tests can pick fixtures from it instead of hard-coding ids.
 */
export async function seed(): Promise<SeedData> {
  await resetEmulators();
  // round-trip through JSON like run-seed.sh/flame does (drops undefineds)
  const data = JSON.parse(
    JSON.stringify(
      generateSeedData({ families: 6, children: 3, gifts: 5, seed: 42 }),
    ),
  ) as SeedData;

  const batch = db.batch();
  for (const [key, collection] of Object.entries(COLLECTIONS)) {
    for (const doc of data[key as keyof SeedData]) {
      batch.set(db.collection(collection).doc(doc.id), doc);
    }
  }
  await batch.commit();
  await seedAuthUsers(app.auth(), data.users);
  return data;
}

/** Narrows away null/undefined, failing the test with a clear message. */
export function defined<T>(value: T | null | undefined, what: string): T {
  if (value == null) throw new Error(`expected ${what}`);
  return value;
}

export function seededUser(data: SeedData, id: string): TestUser {
  const user = data.users.find((u) => u.id === id);
  if (!user) throw new Error(`no seeded user ${id}`);
  return { uid: user.id, email: user.email, password: DEFAULT_PASSWORD };
}

/** The seeded drive whose window contains now. */
export function activeDrive(data: SeedData) {
  const now = Date.now();
  const drive = data.giftDrives.find(
    (d) => Date.parse(d.startDate) <= now && now <= Date.parse(d.endDate),
  );
  if (!drive) throw new Error("seed has no active gift drive");
  return drive;
}

export async function getDoc<T>(collection: string, id: string) {
  const snap = await db.collection(collection).doc(id).get();
  return snap.data() as T | undefined;
}

export async function queryDocs<T>(
  collection: string,
  field: string,
  value: unknown,
) {
  const snap = await db.collection(collection).where(field, "==", value).get();
  return snap.docs.map((d) => d.data() as T);
}

export async function storageFileExists(path: string) {
  const [exists] = await app.storage().bucket().file(path).exists();
  return exists;
}
