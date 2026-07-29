import { useCallback, useState } from "react";
import type { CommittedChild, GiftFormState } from "./types";
import { createInitialGiftStates } from "./utils";
import {
  useMarkGiftDelivered,
  useMarkGiftPurchased,
  useUnclaimGifts,
  useUpdateGiftTrackingNumber,
  useUploadDeliveryReceipt,
  useUploadPurchaseReceipt,
} from "@/hooks/mutations/useClaimGifts";

export function useDonorChildDetailState(child: CommittedChild) {
  const [giftStates, setGiftStates] = useState<Record<string, GiftFormState>>(
    createInitialGiftStates(child.gifts),
  );
  const [unclaimTargetId, setUnclaimTargetId] = useState<string | null>(null);
  const markGiftPurchased = useMarkGiftPurchased();
  const markGiftDelivered = useMarkGiftDelivered();
  const unclaimGifts = useUnclaimGifts();
  const updateGiftTrackingNumber = useUpdateGiftTrackingNumber();
  const uploadPurchaseReceipt = useUploadPurchaseReceipt();
  const uploadDeliveryReceipt = useUploadDeliveryReceipt();

  const set = useCallback((id: string, patch: Partial<GiftFormState>) => {
    setGiftStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch, changesSaved: false },
    }));
  }, []);

  const handleOrdered = useCallback(
    (id: string) => {
      markGiftPurchased.mutate(id, {
        onSuccess: () => {
          setGiftStates((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              ordered: true,
              changesSaved: true,
            },
          }));
        },
      });
    },
    [markGiftPurchased],
  );

  const handleDelivered = useCallback(
    (id: string) => {
      markGiftDelivered.mutate(id, {
        onSuccess: () => {
          setGiftStates((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              ordered: true,
              delivered: true,
              savedDelivered: true,
              changesSaved: true,
            },
          }));
        },
      });
    },
    [markGiftDelivered],
  );

  const handleUndoDelivery = useCallback(
    (id: string) => set(id, { delivered: false }),
    [set],
  );

  const handleReceipt = useCallback(
    async (id: string, file: File | string | null) => {
      if (!file) {
        set(id, { receiptFileName: null, receiptPath: null });
        return;
      }

      if (typeof file === "string") {
        set(id, { receiptFileName: file });
        return;
      }

      uploadPurchaseReceipt.mutate(
        {
          giftId: id,
          file,
          trackingNumber: giftStates[id]?.tracking,
        },
        {
          onSuccess: (data) => {
            setGiftStates((prev) => ({
              ...prev,
              [id]: {
                ...prev[id],
                tracking: data.trackingNumber,
                savedTracking: data.trackingNumber,
                receiptFileName: file.name,
                receiptPath: data.documentationPath,
                savedReceiptFileName: file.name,
                savedReceiptPath: data.documentationPath,
                changesSaved: true,
              },
            }));
          },
        },
      );
    },
    [giftStates, set, uploadPurchaseReceipt],
  );

  const handleDeliveryReceipt = useCallback(
    async (id: string, file: File | string | null) => {
      if (!file) {
        set(id, { deliveryReceiptFileName: null, deliveryReceiptPath: null });
        return;
      }

      if (typeof file === "string") {
        set(id, { deliveryReceiptFileName: file });
        return;
      }

      uploadDeliveryReceipt.mutate(
        { giftId: id, file },
        {
          onSuccess: (data) => {
            setGiftStates((prev) => ({
              ...prev,
              [id]: {
                ...prev[id],
                deliveryReceiptFileName: file.name,
                deliveryReceiptPath: data.documentationPath,
                savedDeliveryReceiptFileName: file.name,
                savedDeliveryReceiptPath: data.documentationPath,
                changesSaved: true,
              },
            }));
          },
        },
      );
    },
    [set, uploadDeliveryReceipt],
  );

  const handleTrackingChange = useCallback(
    (id: string, value: string) => set(id, { tracking: value }),
    [set],
  );

  const handleSave = useCallback(
    async (id: string) => {
      const currentState = giftStates[id];
      if (!currentState) return;

      const nextTracking = currentState.tracking.trim();
      if (nextTracking !== currentState.savedTracking) {
        const result = await updateGiftTrackingNumber.mutateAsync({
          giftId: id,
          trackingNumber: nextTracking,
        });

        setGiftStates((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            tracking: result.trackingNumber,
            savedTracking: result.trackingNumber,
            changesSaved: true,
          },
        }));
        return;
      }

      const hasSavedNonTrackingFields =
        currentState.delivered === currentState.savedDelivered &&
        currentState.receiptFileName === currentState.savedReceiptFileName &&
        currentState.receiptPath === currentState.savedReceiptPath &&
        currentState.deliveryReceiptFileName ===
          currentState.savedDeliveryReceiptFileName &&
        currentState.deliveryReceiptPath ===
          currentState.savedDeliveryReceiptPath;

      setGiftStates((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          changesSaved: hasSavedNonTrackingFields,
        },
      }));
    },
    [giftStates, updateGiftTrackingNumber],
  );

  const handleUnclaimConfirm = useCallback(() => {
    if (!unclaimTargetId) return;
    unclaimGifts.mutate([unclaimTargetId], {
      onSuccess: () => {
        setGiftStates((prev) => ({
          ...prev,
          [unclaimTargetId]: {
            ...prev[unclaimTargetId],
            unclaimed: true,
            changesSaved: true,
          },
        }));
        setUnclaimTargetId(null);
      },
    });
  }, [unclaimGifts, unclaimTargetId]);

  const allSaved = Object.values(giftStates).every((gift) => gift.changesSaved);
  const visibleGifts = child.gifts.filter(
    (gift) =>
      !giftStates[gift.id]?.unclaimed && !giftStates[gift.id]?.receivedByFamily,
  );
  const receivedGifts = child.gifts.filter(
    (gift) => giftStates[gift.id]?.receivedByFamily,
  );

  return {
    giftStates,
    unclaimTargetId,
    setUnclaimTargetId,
    allSaved,
    visibleGifts,
    receivedGifts,
    markGiftPurchased,
    markGiftDelivered,
    updateGiftTrackingNumber,
    uploadPurchaseReceipt,
    uploadDeliveryReceipt,
    handleOrdered,
    handleDelivered,
    handleUndoDelivery,
    handleReceipt,
    handleDeliveryReceipt,
    handleTrackingChange,
    handleSave,
    handleUnclaimConfirm,
  };
}
