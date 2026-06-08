import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UserRole } from "common";
import { useClaimGifts } from "@/hooks/mutations/useClaimGifts";
import { useLogin } from "@/hooks/mutations/loginMutation";
import { useRegisterDonor } from "@/hooks/mutations/useRegisterDonor";
import { useLocalCartData } from "@/hooks/queries/useCartGifts";
import { cartCollection } from "@/local/cartCollection";
import type { CartItem } from "@/local/cartCollection";
import type { AuthContext } from "@/server/functions/auth";
import { toast } from "@/lib/toast";
import { useQueryClient } from "@tanstack/react-query";
import { queries } from "@/queries";
import { useMfaFlow } from "@/hooks/useMfaFlow";
import type { MfaFlowResult } from "@/hooks/useMfaFlow";

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
  confirmClaim: () => void;
  submitLogin: (email: string, password: string) => Promise<void>;
  submitRegister: (data: RegisterDonorInput) => Promise<void>;
  closeAll: () => void;
  setAuthMode: (mode: "login" | "register") => void;
  mfaMethodDialogProps: MfaFlowResult["mfaMethodDialogProps"];
  mfaDialogProps: MfaFlowResult["mfaDialogProps"];
}

export function useCheckoutFlow(auth: AuthContext): CheckoutFlowState {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [disabledMessage, setDisabledMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const { data: localCart } = useLocalCartData();

  const queryClient = useQueryClient();
  const claimMutation = useClaimGifts();
  const loginMutation = useLogin();
  const registerMutation = useRegisterDonor();

  const isPending =
    claimMutation.isPending ||
    loginMutation.isPending ||
    registerMutation.isPending;

  const clearLocalCart = () => {
    localCart?.forEach((item: CartItem) => cartCollection.delete(item.id));
  };

  const confirmClaim = () => {
    const giftIds = localCart?.map((item: CartItem) => item.id) ?? [];

    claimMutation.mutate(giftIds, {
      onSuccess: () => {
        clearLocalCart();
        setConfirmModalOpen(false);
        setAuthModalOpen(false);
        navigate({ to: "/donor/home" });
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Failed to claim gifts";
        toast.error(message);
        queryClient.invalidateQueries({ queryKey: queries.gifts.cart._def });
      },
    });
  };

  const { handleMfa, mfaMethodDialogProps, mfaDialogProps } = useMfaFlow(
    (result) => {
      if (!result || result.role !== UserRole.DONOR) {
        setAuthModalOpen(false);
        setDisabledMessage(
          "Only donors can claim gifts. Please log in with a donor account.",
        );
        return;
      }
      setAuthModalOpen(false);
      confirmClaim();
    },
  );

  const submitLogin = async (email: string, password: string) => {
    loginMutation.mutate(
      { email, password, callback: handleMfa },
      {
        onSuccess: async (session) => {
          if (!session || session.role !== UserRole.DONOR) {
            setAuthModalOpen(false);
            setDisabledMessage(
              "Only donors can claim gifts. Please log in with a donor account.",
            );
            return;
          }

          setAuthModalOpen(false);
          confirmClaim();
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Failed to login";
          console.log(message);
          toast.error("Failed to login. Check your username and password.");
        },
      },
    );
  };

  const submitRegister = async (data: RegisterDonorInput) => {
    try {
      await registerMutation.mutateAsync(data);
      loginMutation.mutate(
        {
          email: data.email,
          password: data.password,
          callback: handleMfa,
        },
        {
          onSuccess: async (session) => {
            if (!session || session.role !== UserRole.DONOR) {
              setAuthModalOpen(false);
              setDisabledMessage(
                "Only donors can claim gifts. Please log in with a donor account.",
              );
              return;
            }

            setAuthModalOpen(false);
            confirmClaim();
          },
          onError: (error) => {
            const message =
              error instanceof Error
                ? error.message
                : "Failed to register or login";
            console.error(message);
            toast.error("Failed to login");
          },
        },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to register or login";
      console.error(message);
      toast.error("Failed to register or login");
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
    setDisabledMessage(
      "Only donors can claim gifts. Please log in with a donor account.",
    );
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
    mfaMethodDialogProps,
    mfaDialogProps,
  };
}
