import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  claimGifts,
  markGiftDelivered,
  markGiftPurchased,
  uploadDeliveryReceipt,
  uploadPurchaseReceipt,
  unclaimGifts,
} from "@/server/functions/donor";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

export function useClaimGifts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftIds: Array<string>) => claimGifts({ data: { giftIds } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
    },
  });
}

export function useUnclaimGifts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftIds: Array<string>) => unclaimGifts({ data: { giftIds } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
    },
  });
}

export function useMarkGiftPurchased() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftId: string) => markGiftPurchased({ data: { giftId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      toast.success("Gift marked as purchased");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark gift as purchased");
    },
  });
}

export function useMarkGiftDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftId: string) => markGiftDelivered({ data: { giftId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      toast.success("Gift marked as delivered");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark gift as delivered");
    },
  });
}

export function useUploadPurchaseReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      giftId: string;
      fileName: string;
      dataUrl: string;
      trackingNumber?: string;
    }) => uploadPurchaseReceipt({ data: params }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      toast.success("Receipt uploaded");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload receipt");
    },
  });
}

export function useUploadDeliveryReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      giftId: string;
      fileName: string;
      dataUrl: string;
    }) => uploadDeliveryReceipt({ data: params }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      toast.success("Delivery receipt uploaded");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload delivery receipt");
    },
  });
}
