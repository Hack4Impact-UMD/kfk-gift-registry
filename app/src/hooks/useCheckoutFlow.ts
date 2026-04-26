import { useState } from "react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { UserRole } from "common";
import { useClaimGifts } from "@/hooks/mutations/useClaimGifts";
import { useLogin } from "@/hooks/mutations/loginMutation";
import { useRegisterDonor } from "@/hooks/mutations/useRegisterDonor";
import { useLocalCartData } from "@/hooks/queries/useCartGifts";
import { cartCollection, type CartItem } from "@/local/cartCollection";
import { toast } from "@/lib/toast";

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
  disabledMessage: string | null;
  start: () => void;
  confirmClaim: () => Promise<void>;
  submitLogin: (email: string, password: string) => Promise<void>;
  submitRegister: (data: RegisterDonorInput) => Promise<void>;
  closeAll: () => void;
  setAuthMode: (mode: "login" | "register") => void;
}


export function useCheckoutFlow(): CheckoutFlowState {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [disabledMessage, setDisabledMessage] = useState<string | null>(null);

  const { auth } = useRouteContext({ from: "/_storefront/checkout" })

  const navigate = useNavigate();

  const { data: localCart } = useLocalCartData();

  const claimMutation = useClaimGifts();
  const loginMutation = useLogin();
  const registerMutation = useRegisterDonor();

  const isPending = claimMutation.isPending || loginMutation.isPending || registerMutation.isPending;

  const clearLocalCart = () => {
    localCart?.forEach((item: CartItem) => cartCollection.delete(item.id));
  };

  const confirmClaim = async () => {
    const giftIds = localCart?.map((item: CartItem) => item.id) ?? [];

    try {
      await claimMutation.mutateAsync(giftIds);
      clearLocalCart();
      setConfirmModalOpen(false);
      setAuthModalOpen(false);
      navigate({ to: "/donor/home" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to claim gifts";
      toast.error(message);
    }
  };

  const submitLogin = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      setAuthModalOpen(false);
      await confirmClaim();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to login";
      toast.error(message);
    }
  };

  const submitRegister = async (data: RegisterDonorInput) => {
    try {
      await registerMutation.mutateAsync({ data });
      await loginMutation.mutateAsync({ email: data.email, password: data.password });
      await confirmClaim();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to register";
      toast.error(message);
    }
  };

  const start = () => {

    if (!localCart || localCart.length === 0) {
      toast.error("No gifts in cart. Please add some gifts to your cart.");
      return;
    }

    if (!auth.isAuthed) {
      setAuthModalOpen(true);
      return;
    }

    if (auth.authUser.role === UserRole.DONOR) {
      setDisabledMessage(null);
      setConfirmModalOpen(true);
      return;
    }

    // User is logged in but not a donor
    setDisabledMessage("Only donors can claim gifts. Please log in with a donor account.");
  };

  const closeAll = () => {
    setAuthModalOpen(false);
    setConfirmModalOpen(false);
    setDisabledMessage(null);
  };

  return {
    authModalOpen,
    confirmModalOpen,
    isPending,
    authMode,
    disabledMessage,
    start,
    confirmClaim,
    submitLogin,
    submitRegister,
    closeAll,
    setAuthMode,
  };
}
