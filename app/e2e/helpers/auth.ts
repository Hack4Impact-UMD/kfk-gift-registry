import { randomUUID } from "node:crypto";
import admin from "firebase-admin";
import { expect } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";

// only ever talk to the emulators
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= "127.0.0.1:9199";

export const PROJECT_ID = "kfk-gift-registry";
const PASSWORD = "Password123!";
export const SESSION_COOKIE_NAME = "__session";

export const app =
  admin.apps.find((a) => a?.name === "e2e") ??
  admin.initializeApp(
    {
      projectId: PROJECT_ID,
      storageBucket: "kfk-gift-registry.firebasestorage.app",
    },
    "e2e",
  );

export type TestUser = { uid: string; email: string; password: string };

/** Creates a fresh donor account (donors don't need MFA to log in). */
export async function createDonor(): Promise<TestUser> {
  const auth = app.auth();
  const email = `e2e-${randomUUID()}@example.com`;
  const user = await auth.createUser({
    email,
    password: PASSWORD,
    displayName: "E2E Donor",
    emailVerified: true,
  });
  await auth.setCustomUserClaims(user.uid, { role: "DONOR" });
  return { uid: user.uid, email, password: PASSWORD };
}

export async function deleteUser(user: TestUser) {
  await app.auth().deleteUser(user.uid);
}

export async function login(
  page: Page,
  user: TestUser,
  landing = "**/donor/home",
) {
  // filling the SSR'd form before hydration falls back to a native GET submit
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByTestId("login-email").fill(user.email);
  await page.getByTestId("login-password").fill(user.password);
  await page.getByTestId("login-submit").click();
  await page.waitForURL(landing);
}

/**
 * Seeded staff have no MFA factor, so login lands on /mfaEnroll (SMS
 * enrollment needs reCAPTCHA, which can't run locally). The session cookie is
 * already set by then, so tests go straight to the staff page they need.
 */
export async function loginStaff(page: Page, user: TestUser, path: string) {
  await login(page, user, "**/mfaEnroll");
  // clicks on SSR'd buttons before hydration are dropped
  await page.goto(path, { waitUntil: "networkidle" });
}

export async function getSessionCookie(context: BrowserContext) {
  const cookies = await context.cookies();
  return cookies.find((c) => c.name === SESSION_COOKIE_NAME && c.value);
}

// firebase persists the signed-in user in this IndexedDB store
const IDB_NAME = "firebaseLocalStorageDb";
const IDB_STORE = "firebaseLocalStorage";

/** uid of the user persisted by client firebase auth, or null */
export function getClientAuthUid(page: Page) {
  return page.evaluate(
    ({ dbName, storeName }) =>
      new Promise<string | null>((resolve, reject) => {
        const req = indexedDB.open(dbName);
        // don't create the db if firebase hasn't yet
        req.onupgradeneeded = () => req.transaction?.abort();
        req.onerror = () => resolve(null);
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            return resolve(null);
          }
          const getAll = db
            .transaction(storeName, "readonly")
            .objectStore(storeName)
            .getAll();
          getAll.onerror = () => reject(getAll.error);
          getAll.onsuccess = () => {
            db.close();
            const entry = (
              getAll.result as Array<{
                fbase_key: string;
                value: { uid?: string };
              }>
            ).find((r) => r.fbase_key.startsWith("firebase:authUser:"));
            resolve(entry?.value.uid ?? null);
          };
        };
      }),
    { dbName: IDB_NAME, storeName: IDB_STORE },
  );
}

/** Removes the persisted client user, simulating lost client auth state. */
export function clearClientAuth(page: Page) {
  return page.evaluate(
    ({ dbName, storeName }) =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.open(dbName);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(storeName, "readwrite");
          tx.objectStore(storeName).clear();
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { dbName: IDB_NAME, storeName: IDB_STORE },
  );
}

/** Firebase writes IndexedDB asynchronously, so poll for the expected uid. */
export async function expectClientAuthUid(page: Page, uid: string | null) {
  await expect.poll(() => getClientAuthUid(page)).toBe(uid);
}
