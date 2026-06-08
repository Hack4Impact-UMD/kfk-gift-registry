import { useCallback, useEffect, useRef, useState } from "react";
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
    onSubmit: (pin: string) => void;
    onCancel: () => void;
  };
}

export function useMfaFlow(
  onSuccess: (result: AuthUser | undefined) => void,
): MfaFlowResult {
  const onSuccessRef = useRef(onSuccess);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const sendMFARef = useRef<(info: MultiFactorInfo) => void>(null);
  const resolveMFARef = useRef<(pin: string) => void>(null);

  const [mfaHints, setMfaHints] = useState<Array<MultiFactorInfo>>([]);
  const [showMFAMethodDialog, setShowMFAMethodDialog] = useState(false);
  const [showMFADialog, setShowMFADialog] = useState(false);

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
            const cred = await verifySMSMFACode(id, pin, resolver);
            const result = await resolve(cred);
            onSuccessRef.current(result);
          };
        } catch (error) {
          toast.error("Failed to send SMS 2FA code!");
          console.error(error);
        }
      };
    },
    [],
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
      onSubmit: (pin) => resolveMFARef.current?.(pin),
      onCancel: () => setShowMFADialog(false),
    },
  };
}
