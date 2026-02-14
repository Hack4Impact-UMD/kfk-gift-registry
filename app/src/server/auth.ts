import { getServerAuth } from "@/lib/firebase.server";
import { createServerFn } from "@tanstack/react-start";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import z from "zod";
import axios, { AxiosError } from "axios"

const loginSchema = z.object({
  email: z.email().nonempty(),
  password: z.string().nonempty()
});


const maxSessionAge = 60 * 60 * 24 * 14 * 1000; //14 days

async function loginWithEmailPassowrd(email: string, password: string) {
  const resp = await axios.post<{
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered: boolean
  }>("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword", {
    email,
    password,
    returnSecureToken: true
  }, {
    params: {
      key: process.env.VITE_FIREBASE_API_KEY
    }
  })

  return resp.data;
}

export const verifySession = createServerFn({
  method: "GET"
}).handler(async () => {
  try {
    const cookies = getCookies();
    const sessionCookie = cookies["__session"];
    const auth = getServerAuth();

    const result = await auth.verifySessionCookie(sessionCookie, true);
    const user = await auth.getUser(result.uid);

    return {

      uid: user.uid,
      displayName: user.displayName,
      disabled: user.disabled,
      email: user.email,
      emailVerified: user.emailVerified,
    };
  } catch (err) {
    console.error("Session verification failed!");
    console.error(err);
    throw new Error("Failed to verify session");
  }
});

export const createSession = createServerFn({
  method: "POST"
})
  .inputValidator((data: { token: string }) => data.token)
  .handler(async ({ data }) => {
    const token = data;
    const auth = getServerAuth();
    const sessionCookie = await auth.createSessionCookie(token, {
      expiresIn: maxSessionAge
    });

    setCookie("__session", sessionCookie, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === "production",
      maxAge: maxSessionAge
    })
  });

export const login = createServerFn({
  method: "POST"
})
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const { email, password } = data;

    try {
      const result = await loginWithEmailPassowrd(email, password);

      const auth = getServerAuth();
      const user = await auth.getUser(result.localId);

      await createSession({
        data: { token: result.localId }
      });

      return {
        uid: user.uid,
        displayName: user.displayName,
        disabled: user.disabled,
        email: user.email,
        emailVerified: user.emailVerified,
      }
    } catch (err) {
      const msg = (err as AxiosError<{ error: { message: string } }>).response?.data?.error?.message as string | undefined;
      console.error("Login failed");
      console.error("Message: " + msg);

      if (msg === "EMAIL_NOT_FOUND" || msg === "INVALID_PASSWORD") {
        throw new Error("Bad email/password");
      } else if (msg === "USER_DISABLED") {
        throw new Error("Account disabled");
      } else {
        throw new Error("Failed to login");
      }
    }
  })

