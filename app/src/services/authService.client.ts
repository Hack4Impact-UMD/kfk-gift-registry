import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase.client";
import { loginWithToken, logoutSession } from "@/server/auth";

export async function login(email: string, password: string) {
  const auth = await getClientAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);

  return await loginWithToken({
    data: {
      token: await result.user.getIdToken(),
    },
  });
}

export async function logout() {
  await signOut(await getClientAuth());
  await logoutSession();
}
