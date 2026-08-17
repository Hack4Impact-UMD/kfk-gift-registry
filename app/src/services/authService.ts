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
  AuthErrorCodes,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
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

// maps errors thrown while rendering the reCAPTCHA verifier or sending the
// SMS code so the UI can surface a specific, actionable message instead of a
// generic "something went wrong" toast
export function getRecaptchaSmsErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case AuthErrorCodes.CAPTCHA_CHECK_FAILED:
        return "reCAPTCHA verification failed. Please try again.";
      case AuthErrorCodes.INVALID_RECAPTCHA_TOKEN:
      case AuthErrorCodes.MISSING_RECAPTCHA_TOKEN:
      case AuthErrorCodes.INVALID_RECAPTCHA_VERSION:
      case AuthErrorCodes.MISSING_RECAPTCHA_VERSION:
      case AuthErrorCodes.INVALID_RECAPTCHA_ACTION:
      case AuthErrorCodes.RECAPTCHA_NOT_ENABLED:
        return "reCAPTCHA could not be verified. Please refresh the page and try again.";
      case AuthErrorCodes.INVALID_APP_CREDENTIAL:
      case AuthErrorCodes.MISSING_APP_CREDENTIAL:
        return "reCAPTCHA setup is invalid. Please refresh the page and try again.";
      case AuthErrorCodes.INVALID_PHONE_NUMBER:
        return "This phone number is invalid.";
      case AuthErrorCodes.MISSING_PHONE_NUMBER:
        return "No phone number is on file for this account.";
      case AuthErrorCodes.QUOTA_EXCEEDED:
        return "SMS quota exceeded. Please try again later.";
      case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
        return "Too many attempts. Please wait a while before trying again.";
      case AuthErrorCodes.INVALID_MFA_SESSION:
      case AuthErrorCodes.MISSING_MFA_SESSION:
        return "Your session has expired. Please log in again.";
      case AuthErrorCodes.NETWORK_REQUEST_FAILED:
        return "Network error. Check your connection and try again.";
      case AuthErrorCodes.INTERNAL_ERROR:
        return "Something went wrong sending the code. Please try again.";
      case AuthErrorCodes.ARGUMENT_ERROR:
        return "reCAPTCHA could not be initialized. Please refresh the page and try again.";
      default:
        return `Failed to send SMS code (${error.code}).`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to send SMS code. Please try again.";
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

  try {
    const newVerificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneInfoOptions,
      verifier,
    );
    return newVerificationId;
  } catch (error) {
    throw new Error(getRecaptchaSmsErrorMessage(error), { cause: error });
  }
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

export async function initRecaptchaVerifier(
  onWidgetError?: (message: string) => void,
) {
  const auth = await getClientAuth();

  try {
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      // fired by the widget itself outside of any promise chain (e.g. token
      // expiry, challenge failure) - verifyPhoneNumber() may not always
      // reject in this case, so this is the only way to notify the caller
      "error-callback": () => {
        onWidgetError?.(
          "reCAPTCHA verification failed. Please try again or refresh the page.",
        );
      },
    });
    await verifier.render();
    return verifier;
  } catch (error) {
    throw new Error(getRecaptchaSmsErrorMessage(error), { cause: error });
  }
}

export async function getEnrolledMFAMethods() {
  const auth = await getClientAuth();
  if (!auth.currentUser) throw new Error("Not authenticated");
  const multiFactorUser = multiFactor(auth.currentUser);
  const options = multiFactorUser.enrolledFactors;

  return options;
}
