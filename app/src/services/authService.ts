import type {
  User,
  MultiFactorInfo,
  MultiFactorResolver,
  AuthError,
  MultiFactorError,
  UserCredential,
} from "firebase/auth";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  multiFactor,
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  getMultiFactorResolver,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import type { AuthUser } from "@/server/functions/auth";
import { loginWithToken, logoutSession } from "@/server/functions/auth";

export type ResolveLoginCallback = (cred: UserCredential) => Promise<AuthUser>;
export type OnMFACallback = (
  resolver: MultiFactorResolver,
  callback: ResolveLoginCallback,
) => void;

export async function login(
  email: string,
  password: string,
  onMfa: OnMFACallback,
) {
  const auth = await getClientAuth();

  const serverLogin = async (result: UserCredential) => {
    return await loginWithToken({
      data: {
        token: await result.user.getIdToken(),
      },
    });
  };

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await serverLogin(result);
  } catch (err) {
    const code = (err as AuthError).code ?? "";
    if (code === "auth/multi-factor-auth-required") {
      const mfaResolver = getMultiFactorResolver(auth, err as MultiFactorError);
      onMfa(mfaResolver, serverLogin);
    } else {
      throw err;
    }
  }
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

export function isMfaEnrolled(user: User) {
  const multifactor = multiFactor(user);
  const enrolledFactors = multifactor.enrolledFactors;

  // ensure that the user's registered phone number on firebase auth is enrolled in mfa, otherwise force enrollment
  // this is primarily used to re-enroll when the user updates their phone number
  return (
    enrolledFactors &&
    enrolledFactors.some(
      (factor: MultiFactorInfo & { phoneNumber?: string }) =>
        factor.factorId === "phone" && factor.phoneNumber === user.phoneNumber,
    )
  );
}

export async function sendSMSMFACode(
  hint: MultiFactorInfo,
  verifier: RecaptchaVerifier,
  resolver: MultiFactorResolver,
) {
  const auth = await getClientAuth();
  const phoneInfoOptions = {
    multiFactorHint: hint,
    session: resolver.session,
  };

  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const newVerificationId = await phoneAuthProvider.verifyPhoneNumber(
    phoneInfoOptions,
    verifier,
  );

  return newVerificationId;
}

export async function verifySMSMFACode(
  verificationId: string,
  verificationCode: string,
  resolver: MultiFactorResolver,
) {
  const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
  return await resolver.resolveSignIn(multiFactorAssertion);
}

export async function initRecaptchaVerifier() {
  const auth = await getClientAuth();
  const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: () => {
      console.log("recaptcha resolved..");
    },
  });
  verifier.render();
  return verifier;
}

export async function getEnrolledMFAMethods() {
  const auth = await getClientAuth();
  if (!auth.currentUser) throw new Error("Not authenticated");
  const multiFactorUser = multiFactor(auth.currentUser);
  const options = multiFactorUser.enrolledFactors;

  return options;
}
