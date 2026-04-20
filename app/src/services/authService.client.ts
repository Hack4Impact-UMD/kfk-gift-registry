import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase.client";
import { loginWithToken, logoutSession } from "@/server/functions/auth";

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

export async function sendPasswordResetEmail(email: string) {
  const auth = await getClientAuth();
  await firebaseSendPasswordResetEmail(auth, email);
}

export async function confirmPasswordReset(
  oobCode: string,
  newPassword: string,
) {
  const auth = await getClientAuth();
  await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
}
