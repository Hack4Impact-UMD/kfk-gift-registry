import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase.client";
import { loginWithToken, logoutSession } from "@/server/auth";
import type { AuthUser } from "@/server/auth";

export async function login(email: string, password: string): Promise<AuthUser> {
  const auth = getClientAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);

  const authUser = await loginWithToken({
    data: {
      token: await result.user.getIdToken(),
    },
  });

  return authUser;
}

export async function logout() {
  await signOut(getClientAuth());
  await logoutSession();
}
