import { useQuery } from "@tanstack/react-query";
import type { GiftStatus } from "common";
import publishedGiftsQueries from "@/queries/publishedGifts";
import {
  useMarkKFKGiftPurchased,
  useMarkKFKGiftDelivered,
  useUpdateKFKTrackingNumber,
  useUnclaimKFKGift,
  useAdminSetGiftStatus,
} from "@/hooks/mutations/useStaffClaim";

const TRACKING_ALLOWED_STATUSES = ["PURCHASED", "DELIVERED", "RECEIVED"];

/**
 * Owns the staff claim lifecycle state machine for a single gift so the dialog
 * component stays declarative. Centralizes the valid-transition rules (mirrored
 * from the server-side checks) and exposes query loading/error state alongside
 * action callbacks with aggregated mutation state.
 *
 * Lifecycle controls are only enabled for `"kfk"` claims (`canManage`); donor
 * claims are read-only here and must be managed from the donor account.
 */
export function useStaffClaimDialog(giftId: string, enabled: boolean) {
  const detailsQuery = useQuery({
    ...publishedGiftsQueries.claimDetailsByGift(giftId),
    enabled: enabled && !!giftId,
  });

  const markPurchased = useMarkKFKGiftPurchased();
  const markDelivered = useMarkKFKGiftDelivered();
  const updateTracking = useUpdateKFKTrackingNumber();
  const unclaim = useUnclaimKFKGift();
  const setStatus = useAdminSetGiftStatus();

  const details = detailsQuery.data;
  const status = details?.gift.status;
  const canManage = details?.claim?.claimType === "kfk";

  const isMutating =
    markPurchased.isPending ||
    markDelivered.isPending ||
    updateTracking.isPending ||
    unclaim.isPending ||
    setStatus.isPending;

  const mutationError =
    markPurchased.error ??
    markDelivered.error ??
    updateTracking.error ??
    unclaim.error ??
    setStatus.error ??
    null;

  return {
    details,
    isLoading: detailsQuery.isLoading,
    error: detailsQuery.error,
    refetch: detailsQuery.refetch,

    status,
    canManage,
    canMarkPurchased: canManage && status === "CLAIMED",
    canMarkDelivered: canManage && status === "PURCHASED",
    canEditTracking:
      canManage && !!status && TRACKING_ALLOWED_STATUSES.includes(status),
    canUnclaim: canManage && status === "CLAIMED",

    isMutating,
    mutationError,

    markPurchased: () => markPurchased.mutate(giftId),
    markDelivered: () => markDelivered.mutate(giftId),
    saveTracking: (trackingNumber: string) =>
      updateTracking.mutate({ giftId, trackingNumber }),
    unclaim: () => unclaim.mutate(giftId),
    setStatus: (nextStatus: GiftStatus) =>
      setStatus.mutate({ giftId, status: nextStatus }),
  };
}
