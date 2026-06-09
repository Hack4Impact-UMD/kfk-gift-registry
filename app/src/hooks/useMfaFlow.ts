import { useCallback, useEffect, useRef, useState } from "react";
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  reload,
  sendEmailVerification,
} from "firebase/auth";
import type {
  MultiFactorInfo,
  MultiFactorResolver,
  RecaptchaVerifier,
} from "firebase/auth";
import type { AuthUser } from "@/server/functions/auth";
import type {
  OnMFACallback,
  ResolveLoginCallback,
} from "@/services/authService.client";
import {
  initRecaptchaVerifier,
  sendSMSMFACode,
  verifySMSMFACode,
} from "@/services/authService.client";
import { toast } from "@/lib/toast";
import { getClientAuth } from "@/lib/firebase.client";

export interface MfaFlowResult {
  handleMfa: OnMFACallback;
  mfaMethodDialogProps: {
    open: boolean;
    hints: Array<MultiFactorInfo>;
    onSelect: (hint: MultiFactorInfo) => void;
    onCancel: () => void;
  };
  mfaDialogProps: {
    open: boolean;
    invalid: boolean;
    onSubmit: (pin: string) => void;
    onCancel: () => void;
  };
}

export function useMfaEnrollFlow(onSuccess: () => void) {
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const resolveEnrollmentRef = useRef<(pin: string) => void>(null);

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [invalidEnrollCode, setInvalidEnrollCode] = useState(false);

  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      initRecaptchaVerifier().then((v) => {
        recaptchaVerifierRef.current = v;
      });
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const enrollMethod = useCallback(
    async (name: string, phone: string) => {
      if (!recaptchaVerifierRef.current)
        throw new Error("recaptcha verifier not found!");
      const auth = await getClientAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const session = await multiFactor(user).getSession();

      if (!phone) {
        throw new Error("User does not have a phone number!");
      }
      const phoneOptions = {
        phoneNumber: phone,
        session: session,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);

      const id = await phoneAuthProvider.verifyPhoneNumber(
        phoneOptions,
        recaptchaVerifierRef.current,
      );

      setShowEnrollDialog(false);
      setShowMFADialog(true);

      resolveEnrollmentRef.current = async (pin: string) => {
        setInvalidEnrollCode(false);
        try {
          const cred = PhoneAuthProvider.credential(id, pin);
          const assertion = PhoneMultiFactorGenerator.assertion(cred);
          await multiFactor(user).enroll(assertion, name);
          onSuccess();
        } catch {
          setInvalidEnrollCode(true);
        }
      };
    },
    [onSuccess],
  );

  const triggerEnroll = useCallback(async () => {
    const auth = await getClientAuth();
    if (!auth.currentUser) throw new Error("not authenticated!");
    await reload(auth.currentUser);
    if (!auth.currentUser.emailVerified) {
      // start with email verification
      try {
        await sendEmailVerification(auth.currentUser);
        toast.success("Verification email sent!");
        setShowEmailDialog(true);
      } catch (err) {
        toast.error("Failed to send verification email");
        console.error(err);
      }
    } else {
      setShowEmailDialog(false);
      setShowEnrollDialog(true);
    }
  }, []);

  return {
    triggerEnroll,
    emailDialogProps: {
      open: showEmailDialog,
      onSubmit: triggerEnroll,
      onCancel: () => setShowEmailDialog(false),
    },
    enrollDialogProps: {
      open: showEnrollDialog,
      onSubmit: enrollMethod,
      onCancel: () => setShowEnrollDialog(false),
    },
    mfaDialogProps: {
      open: showMFADialog,
      invalid: invalidEnrollCode,
      onSubmit: (pin: string) => resolveEnrollmentRef.current?.(pin),
      onCancel: () => {
        setShowMFADialog(false);
        setInvalidEnrollCode(false);
      },
    },
  };
}

export function useMfaFlow(
  onSuccess: (result: AuthUser | undefined) => void,
): MfaFlowResult {
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const sendMFARef = useRef<(info: MultiFactorInfo) => void>(null);
  const resolveMFARef = useRef<(pin: string) => void>(null);

  const [mfaHints, setMfaHints] = useState<Array<MultiFactorInfo>>([]);
  const [showMFAMethodDialog, setShowMFAMethodDialog] = useState(false);
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [invalidMfaCode, setInvalidMfaCode] = useState(false);

  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      initRecaptchaVerifier().then((v) => {
        recaptchaVerifierRef.current = v;
      });
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleMfa: OnMFACallback = useCallback(
    (resolver: MultiFactorResolver, resolve: ResolveLoginCallback) => {
      setMfaHints(resolver.hints);
      setShowMFAMethodDialog(true);

      sendMFARef.current = async (info: MultiFactorInfo) => {
        if (!recaptchaVerifierRef.current) return;
        try {
          const id = await sendSMSMFACode(
            info,
            recaptchaVerifierRef.current,
            resolver,
          );
          toast.success("Code sent!");
          setShowMFAMethodDialog(false);
          setShowMFADialog(true);

          resolveMFARef.current = async (pin: string) => {
            setInvalidMfaCode(false);
            try {
              const cred = await verifySMSMFACode(id, pin, resolver);
              const result = await resolve(cred);
              onSuccess(result);
            } catch {
              setInvalidMfaCode(true);
            }
          };
        } catch (error) {
          toast.error("Failed to send SMS 2FA code!");
          console.error(error);
        }
      };
    },
    [onSuccess],
  );

  return {
    handleMfa,
    mfaMethodDialogProps: {
      open: showMFAMethodDialog,
      hints: mfaHints,
      onSelect: (hint) => sendMFARef.current?.(hint),
      onCancel: () => setShowMFAMethodDialog(false),
    },
    mfaDialogProps: {
      open: showMFADialog,
      invalid: invalidMfaCode,
      onSubmit: (pin) => resolveMFARef.current?.(pin),
      onCancel: () => {
        setShowMFADialog(false);
        setInvalidMfaCode(false);
      },
    },
  };
}
