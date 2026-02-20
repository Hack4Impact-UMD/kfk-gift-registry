import { createServerFn } from "@tanstack/react-start";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import z from "zod";
import { Duration } from "luxon"
import { UserRole } from "common"
import { authMiddleware } from "./middleware/authMiddleware";
import type { UserRecord } from "firebase-admin/auth";
import { getServerAuth } from "@/lib/firebase.server";

export type AuthUser = {
  uid: string;
  displayName: string | undefined;
  disabled: boolean;
  email: string | undefined;
  emailVerified: boolean;
  role: UserRole;
};

export type AuthContext =
  | AuthContextAuthenticated
  | AuthContextNotAuthenticated;

type AuthContextAuthenticated = {
  isAuthed: true;
  authUser: AuthUser;
};

type AuthContextNotAuthenticated = {
  isAuthed: false;
  authUser: null;
};

const toAuthUser = (user: UserRecord): AuthUser => ({
  uid: user.uid,
  displayName: user.displayName,
  disabled: user.disabled,
  email: user.email,
  emailVerified: user.emailVerified,
  role: user.customClaims?.role ?? UserRole.DONOR
});

const loginSchema = z.object({
  token: z.string().nonempty()
});

const SESSION_COOKIE_NAME = "__session";
const MAX_SESSION_AGE = Duration.fromObject({ days: 14 });

export const verifySession = createServerFn({
  method: "GET",
}).handler(async () => {
  try {
    const cookies = getCookies();
    const sessionCookie = cookies[SESSION_COOKIE_NAME];
    if (!sessionCookie) return null;

    const auth = getServerAuth();

    const result = await auth.verifySessionCookie(sessionCookie, true);
    const user = await auth.getUser(result.uid);

    return toAuthUser(user);
  } catch (err) {
    console.warn("Session verification failed! ");
    return null;
  }
});

export const createSession = createServerFn({
  method: "POST",
})
  .inputValidator((data: { token: string }) => data.token)
  .handler(async ({ data }) => {
    const token = data;
    const auth = getServerAuth();
    const sessionCookie = await auth.createSessionCookie(token, {
      expiresIn: MAX_SESSION_AGE.toMillis(),
    });

    setCookie(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: MAX_SESSION_AGE.as("seconds"),
    });
  });

export const loginWithToken = createServerFn({
  method: "POST",
})
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const { token } = data;

    try {
      const auth = getServerAuth();
      const result = await auth.verifyIdToken(token);
      const user = await auth.getUser(result.uid);

      await createSession({
        data: { token },
      });

      return toAuthUser(user);
    } catch (err) {
      console.error("Login failed");
      console.error(err);
      throw new Error("Failed to login");
    }
  });

export const logoutSession = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const auth = getServerAuth();

    await auth.revokeRefreshTokens(context.authUser.uid);

    setCookie(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  });
