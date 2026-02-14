import { createServerFn } from "@tanstack/react-start";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import z from "zod";
import axios from "axios";
import { Duration } from "luxon"
import { authMiddleware } from "./middleware/authMiddleware";
import type { AxiosError } from "axios";
import type { UserRecord } from "firebase-admin/auth";
import { getServerAuth } from "@/lib/firebase.server";

export type AuthUser = {
  uid: string;
  displayName: string | undefined;
  disabled: boolean;
  email: string | undefined;
  emailVerified: boolean;
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
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().nonempty(),
});

const SESSION_COOKIE_NAME = "__session";
const MAX_SESSION_AGE = Duration.fromObject({ days: 14 });

async function loginWithEmailPassword(email: string, password: string) {
  const url =
    process.env.NODE_ENV === "production"
      ? "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
      : "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";

  const resp = await axios.post<{
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered: boolean;
  }>(
    url,
    {
      email,
      password,
      returnSecureToken: true,
    },
    {
      params: {
        key: process.env.VITE_FIREBASE_API_KEY,
      },
    },
  );

  return resp.data;
}

export const verifySession = createServerFn({
  method: "GET",
}).handler(async () => {
  try {
    const cookies = getCookies();
    const sessionCookie = cookies[SESSION_COOKIE_NAME];
    if (!sessionCookie) throw new Error("No session cookie found");

    const auth = getServerAuth();

    const result = await auth.verifySessionCookie(sessionCookie, true);
    const user = await auth.getUser(result.uid);

    return toAuthUser(user);
  } catch (err) {
    console.error("Session verification failed!");
    console.error(err);
    throw new Error("Failed to verify session");
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

export const login = createServerFn({
  method: "POST",
})
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const { email, password } = data;

    try {
      const result = await loginWithEmailPassword(email, password);

      const auth = getServerAuth();
      const user = await auth.getUser(result.localId);

      await createSession({
        data: { token: result.idToken },
      });

      return toAuthUser(user);
    } catch (err) {
      console.error(err);
      const msg = (err as AxiosError<{ error?: { message?: string } }>).response
        ?.data.error?.message;
      console.error("Login failed");
      console.error("Message: " + msg);

      if (
        msg === "EMAIL_NOT_FOUND" ||
        msg === "INVALID_LOGIN_CREDENTIALS" ||
        msg === "INVALID_PASSWORD"
      ) {
        throw new Error("Bad email or password");
      } else if (msg === "USER_DISABLED") {
        throw new Error("Account disabled");
      } else {
        throw new Error("Failed to login");
      }
    }
  });

export const logout = createServerFn({
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
