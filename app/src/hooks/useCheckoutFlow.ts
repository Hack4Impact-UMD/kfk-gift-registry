import { useState } from "react";

export interface RegisterDonorInput {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface CheckoutFlowState {
  authModalOpen: boolean;
  confirmModalOpen: boolean;
  isPending: boolean;
  authMode: "login" | "register";
  start: () => void;
  confirmClaim: () => Promise<void>;
  submitLogin: (email: string, password: string) => Promise<void>;
  submitRegister: (data: RegisterDonorInput) => Promise<void>;
  closeAll: () => void;
  setAuthMode: (mode: "login" | "register") => void;
}


// Real auth/claim logic will replace this
export function useCheckoutFlow(): CheckoutFlowState {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const closeAll = () => {
    setAuthModalOpen(false);
    setConfirmModalOpen(false);
  };

  return {
    authModalOpen,
    confirmModalOpen,
    isPending: false,
    authMode,
    start: () => setConfirmModalOpen(true),
    confirmClaim: async () => setConfirmModalOpen(false),
    submitLogin: async (_email, _password) => setAuthModalOpen(false),
    submitRegister: async (_data) => setAuthModalOpen(false),
    closeAll,
    setAuthMode,
  };
}
