import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import type { RecaptchaVerifier } from "firebase/auth";
import { initRecaptchaVerifier } from "@/services/authService";
import { toast } from "@/lib/toast";

const RecaptchaContext = createContext<
  { getVerifier: () => Promise<RecaptchaVerifier> } | undefined
>(undefined);

export function RecaptchaProvider({ children }: { children: ReactNode }) {
  const verifierRef = useRef<Promise<RecaptchaVerifier> | null>(null);

  const getVerifier = useCallback(() => {
    if (!verifierRef.current) {
      verifierRef.current = initRecaptchaVerifier((message) => {
        toast.error(message);
      }).catch((err: unknown) => {
        verifierRef.current = null;
        throw err;
      });
    }
    return verifierRef.current;
  }, []);

  useEffect(() => {
    getVerifier().catch((err: unknown) => {
      toast.error("Failed to initialize ReCaptcha");
      console.error("recaptcha init failed", err);
    });

    return () => {
      const pending = verifierRef.current;
      verifierRef.current = null;
      pending?.then((verifier) => verifier.clear()).catch(() => { });
    };
  }, [getVerifier]);

  return (
    <RecaptchaContext.Provider value={{ getVerifier }}>
      {children}
    </RecaptchaContext.Provider>
  );
}

export function useRecaptcha() {
  const context = useContext(RecaptchaContext);
  if (context === undefined) {
    throw new Error("useRecaptcha not used within RecaptchaProvider");
  }
  return context;
}
