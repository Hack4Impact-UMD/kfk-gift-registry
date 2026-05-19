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
import { useMarkGiftPurchased } from "@/hooks/mutations/useClaimGifts";

export function ChildBlock({ child }: { child: CommittedChild }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [giftStates, setGiftStates] = useState<Record<string, GiftFormState>>(
    createInitialGiftStates(child.gifts),
  );
  const [unclaimTargetId, setUnclaimTargetId] = useState<string | null>(null);
  const markGiftPurchased = useMarkGiftPurchased();

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
    (id: string) => set(id, { delivered: true }),
    [set],
  );
  const handleUndoDelivery = useCallback(
    (id: string) => set(id, { delivered: false }),
    [set],
  );
  const handleReceipt = useCallback(
    (id: string, f: string | null) => set(id, { receiptFileName: f }),
    [set],
  );
  const handleDeliveryReceipt = useCallback(
    (id: string, f: string | null) => set(id, { deliveryReceiptFileName: f }),
    [set],
  );
  const handleTrackingChange = useCallback(
    (id: string, v: string) => set(id, { tracking: v }),
    [set],
  );

  // Single definition of handleSave — promotes pendingUnclaim and clears dirty
  const handleSave = useCallback((id: string) => {
    setGiftStates((p) => ({
      ...p,
      [id]: {
        ...p[id],
        changesSaved: true,
        unclaimed: p[id]?.pendingUnclaim, // promote pending to actual
      },
    }));
  }, []);

  const allSaved = Object.values(giftStates).every((gift) => gift.changesSaved);

  const handleUnclaimConfirm = useCallback(() => {
    if (!unclaimTargetId) return;
    set(unclaimTargetId, { pendingUnclaim: true });
    setUnclaimTargetId(null);
  }, [unclaimTargetId, set]);

  const visibleGifts = child.gifts.filter(
    (g) =>
      !giftStates[g.id]?.unclaimed &&
      !giftStates[g.id]?.pendingUnclaim &&
      !giftStates[g.id]?.receivedByFamily,
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
