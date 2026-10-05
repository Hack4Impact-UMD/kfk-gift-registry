import { expect, test } from "@playwright/test";
import {
  SESSION_COOKIE_NAME,
  clearClientAuth,
  createDonor,
  deleteUser,
  expectClientAuthUid,
  getSessionCookie,
  login,
} from "./helpers/auth";
import type { TestUser } from "./helpers/auth";

let user: TestUser;

test.beforeEach(async () => {
  user = await createDonor();
});

test.afterEach(async () => {
  await deleteUser(user);
});

test("login signs in both the session and client auth", async ({
  page,
  context,
}) => {
  await login(page, user);

  expect(await getSessionCookie(context)).toBeDefined();
  await expectClientAuthUid(page, user.uid);

  // still in sync after a full page load
  await page.reload();
  await expect(page).toHaveURL(/\/donor\/home/);
  await expectClientAuthUid(page, user.uid);
});

test("expired session signs out client auth on load", async ({
  page,
  context,
}) => {
  await login(page, user);
  await expectClientAuthUid(page, user.uid);

  await context.clearCookies({ name: SESSION_COOKIE_NAME });
  await page.reload();

  await expect(page).toHaveURL(/\/login/);
  await expectClientAuthUid(page, null);
});

test("server fn auth rejection signs out without a reload", async ({
  page,
  context,
}) => {
  await login(page, user);
  await expectClientAuthUid(page, user.uid);

  // the session query is still cached as authed; a background refetch of the
  // (stale) donor queries is rejected by authMiddleware instead
  await context.clearCookies({ name: SESSION_COOKIE_NAME });
  await page.evaluate(() =>
    window.dispatchEvent(new Event("visibilitychange")),
  );

  await expect(page).toHaveURL(/\/login/);
  await expectClientAuthUid(page, null);
});

test("lost client auth clears the session", async ({ page, context }) => {
  await login(page, user);
  await expectClientAuthUid(page, user.uid);

  await clearClientAuth(page);
  await page.reload();

  await expect(page).toHaveURL(/\/login/);
  await expect.poll(() => getSessionCookie(context)).toBeUndefined();
  await expectClientAuthUid(page, null);
});

test("logging in after a stale client user keeps the new session", async ({
  page,
  context,
}) => {
  await login(page, user);
  await context.clearCookies({ name: SESSION_COOKIE_NAME });
  await page.reload();
  await expect(page).toHaveURL(/\/login/);

  // the sync hook must not sign out the user mid-login
  await login(page, user);
  await expectClientAuthUid(page, user.uid);
  expect(await getSessionCookie(context)).toBeDefined();
});
