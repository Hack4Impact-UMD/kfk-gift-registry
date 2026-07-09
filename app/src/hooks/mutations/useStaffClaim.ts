import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  claimGiftAsKFK,
  markKFKGiftPurchased,
  markKFKGiftDelivered,
  updateKFKTrackingNumber,
  unclaimKFKGift,
} from "@/server/functions/staffClaim";
import publishedGiftsQueries from "@/queries/publishedGifts";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

/**
 * Invalidates every view that reflects a staff gift claim: the staff published
 * gifts table + claim-details dialog (`publishedGiftsQueries`), and the
 * child-profile claim views (`children` / `claims`).
 */
function useInvalidateStaffClaim() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: publishedGiftsQueries._def }),
      queryClient.invalidateQueries({ queryKey: queries.children._def }),
      queryClient.invalidateQueries({ queryKey: queries.claims._def }),
    ]);
  };
}

export function useClaimGiftAsKFK() {
  const invalidate = useInvalidateStaffClaim();

  return useMutation({
    mutationFn: (giftId: string) => claimGiftAsKFK({ data: { giftId } }),
    onSuccess: async () => {
      await invalidate();
      toast.success("Gift claimed for KFK");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to claim gift");
    },
  });
}

export function useMarkKFKGiftPurchased() {
  const invalidate = useInvalidateStaffClaim();

  return useMutation({
    mutationFn: (giftId: string) => markKFKGiftPurchased({ data: { giftId } }),
    onSuccess: async () => {
      await invalidate();
      toast.success("Gift marked as purchased");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark gift as purchased");
    },
  });
}

export function useMarkKFKGiftDelivered() {
  const invalidate = useInvalidateStaffClaim();

  return useMutation({
    mutationFn: (giftId: string) => markKFKGiftDelivered({ data: { giftId } }),
    onSuccess: async () => {
      await invalidate();
      toast.success("Gift marked as delivered");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark gift as delivered");
    },
  });
}

export function useUpdateKFKTrackingNumber() {
  const invalidate = useInvalidateStaffClaim();

  return useMutation({
    mutationFn: (params: { giftId: string; trackingNumber: string }) =>
      updateKFKTrackingNumber({ data: params }),
    onSuccess: async () => {
      await invalidate();
      toast.success("Tracking number saved");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save tracking number");
    },
  });
}

export function useUnclaimKFKGift() {
  const invalidate = useInvalidateStaffClaim();

  return useMutation({
    mutationFn: (giftId: string) => unclaimKFKGift({ data: { giftId } }),
    onSuccess: async () => {
      await invalidate();
      toast.success("Gift unclaimed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unclaim gift");
    },
  });
}
