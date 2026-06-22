import { useCallback, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useBlocker } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommittedChild, GiftFormState } from "./types";
import { createInitialGiftStates, getBlueBackground } from "./utils";
import { ChildDetailSection } from "./ChildDetailSection";
import { UnclaimDialog } from "./UnclaimDialog";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import {
  useMarkGiftDelivered,
  useMarkGiftPurchased,
  useUnclaimGifts,
  useUpdateGiftTrackingNumber,
  useUploadDeliveryReceipt,
  useUploadPurchaseReceipt,
} from "@/hooks/mutations/useClaimGifts";

export function ChildBlock({ child }: { child: CommittedChild }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  // Single definition of set — marks dirty on every state change
  const set = useCallback((id: string, patch: Partial<GiftFormState>) => {
    setGiftStates((p) => ({
      ...p,
      [id]: { ...p[id], ...patch, changesSaved: false },
    }));
  }, []);

  const handleOrdered = useCallback(
    (id: string) => {
      markGiftPurchased.mutate(id, {
        onSuccess: () => {
          setGiftStates((p) => ({
            ...p,
            [id]: {
              ...p[id],
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
          setGiftStates((p) => ({
            ...p,
            [id]: {
              ...p[id],
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
            setGiftStates((p) => ({
              ...p,
              [id]: {
                ...p[id],
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
        {
          giftId: id,
          file,
        },
        {
          onSuccess: (data) => {
            setGiftStates((p) => ({
              ...p,
              [id]: {
                ...p[id],
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
    (id: string, v: string) => set(id, { tracking: v }),
    [set],
  );

  const handleSave = useCallback(
    async (id: string) => {
      const currentState = giftStates[id];
      if (!currentState) {
        return;
      }

      const nextTracking = currentState.tracking.trim();
      if (nextTracking !== currentState.savedTracking) {
        const result = await updateGiftTrackingNumber.mutateAsync({
          giftId: id,
          trackingNumber: nextTracking,
        });

        setGiftStates((p) => ({
          ...p,
          [id]: {
            ...p[id],
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

      setGiftStates((p) => ({
        ...p,
        [id]: {
          ...p[id],
          changesSaved: hasSavedNonTrackingFields,
        },
      }));
    },
    [giftStates, updateGiftTrackingNumber],
  );

  const allSaved = Object.values(giftStates).every((gift) => gift.changesSaved);

  const handleUnclaimConfirm = useCallback(() => {
    if (!unclaimTargetId) return;
    unclaimGifts.mutate([unclaimTargetId], {
      onSuccess: () => {
        setGiftStates((p) => ({
          ...p,
          [unclaimTargetId]: {
            ...p[unclaimTargetId],
            unclaimed: true,
            changesSaved: true,
          },
        }));
        setUnclaimTargetId(null);
      },
    });
  }, [unclaimGifts, unclaimTargetId]);

  const visibleGifts = child.gifts.filter(
    (g) => !giftStates[g.id]?.unclaimed && !giftStates[g.id]?.receivedByFamily,
  );

  const blocker = useBlocker({ condition: !allSaved });

  return (
    <>
      <Card
        className="flex w-full flex-col items-center gap-3 px-6 py-7 text-center text-white shadow-lg md:px-8"
        style={getBlueBackground()}
      >
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">
          Gifts you committed for {child.firstName}:
        </h3>
        <img
          src={child.photoUrl}
          className="h-32 w-32 rounded-2xl border-3 border-white object-cover shadow-md md:h-36 md:w-36"
          alt={`${child.firstName} ${child.lastName}`}
        />
        <h2 className="font-gaegu text-2xl font-bold">
          {child.firstName} {child.lastName}
        </h2>
        <h3
          className={cn(
            "w-28 rounded-full px-1 py-0.5 text-sm font-medium",
            child.category === "Warrior"
              ? "bg-[#FFF8C2] text-[#733C10]"
              : "bg-[#D4EAFF] text-kfk-blue",
          )}
        >
          {child.category}
        </h3>
        <p className="rounded-full bg-white/12 px-4 py-1 text-sm text-white/90">
          {visibleGifts.length} active{" "}
          {visibleGifts.length === 1 ? "gift" : "gifts"}
        </p>

        <div className="my-2 flex w-full flex-col gap-2">
          {visibleGifts.map((g) => {
            const purchased = giftStates[g.id]?.ordered ?? false;
            return (
              <Card
                key={g.id}
                className="flex flex-col gap-2 rounded-xl border-0 p-3 text-left shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="line-clamp-1 font-gaegu text-lg text-primary">
                    {g.title}
                  </span>
                  <h3
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                      purchased
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-kfk-red",
                    )}
                  >
                    {purchased ? "Purchased" : "Not Purchased"}
                  </h3>
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          type="button"
          aria-expanded={detailsOpen}
          className="flex items-center gap-1 rounded-full bg-white px-6 font-gaegu text-lg font-bold text-kfk-blue shadow-sm hover:bg-white/90"
          onClick={() => setDetailsOpen((o) => !o)}
        >
          {detailsOpen ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="size-4" />
            </>
          ) : (
            <>
              <span>Show More</span>
              <ChevronDown className="size-4" />
            </>
          )}
        </Button>
      </Card>

      {detailsOpen && (
        <ChildDetailSection
          child={child}
          giftStates={giftStates}
          isOrdering={markGiftPurchased.isPending}
          isDelivering={markGiftDelivered.isPending}
          isSavingTracking={updateGiftTrackingNumber.isPending}
          isUploadingReceipt={uploadPurchaseReceipt.isPending}
          isUploadingDeliveryReceipt={uploadDeliveryReceipt.isPending}
          onOrdered={handleOrdered}
          onDelivered={handleDelivered}
          onUndoDelivery={handleUndoDelivery}
          onReceipt={handleReceipt}
          onDeliveryReceipt={handleDeliveryReceipt}
          onTrackingChange={handleTrackingChange}
          onUnclaimRequest={(id) => setUnclaimTargetId(id)}
          onSave={handleSave}
        />
      )}

      <UnclaimDialog
        open={unclaimTargetId !== null}
        onCancel={() => setUnclaimTargetId(null)}
        onConfirm={handleUnclaimConfirm}
      />

      <UnsavedChangesDialog
        open={blocker.status === "blocked"}
        onDiscard={() => blocker.proceed?.()}
        onSave={() => blocker.reset?.()}
      />
    </>
  );
}
