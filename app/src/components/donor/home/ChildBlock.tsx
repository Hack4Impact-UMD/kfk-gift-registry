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

export function ChildBlock({ child }: { child: CommittedChild }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [giftStates, setGiftStates] = useState<Record<string, GiftFormState>>(
    createInitialGiftStates(child.gifts),
  );
  const [unclaimTargetId, setUnclaimTargetId] = useState<string | null>(null);

  // Single definition of set — marks dirty on every state change
  const set = useCallback((id: string, patch: Partial<GiftFormState>) => {
    setGiftStates((p) => ({
      ...p,
      [id]: { ...p[id], ...patch, changesSaved: false },
    }));
  }, []);

  const handleOrdered = useCallback(
    (id: string) => set(id, { ordered: true }),
    [set],
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
        className="flex w-full flex-col gap-2 px-10 py-6 text-center text-white shadow-lg items-center"
        style={getBlueBackground()}
      >
        <h3 className="mb-2 font-bold">
          Gifts you committed for {child.firstName}:
        </h3>
        <img
          src={child.photoUrl}
          className="h-20 w-30 rounded-2xl border-3 border-white object-cover"
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

        <div className="my-3 flex w-full flex-col gap-2">
          {visibleGifts.map((g) => {
            const purchased = giftStates[g.id]?.ordered ?? false;
            return (
              <Card key={g.id} className="flex flex-col gap-2 rounded-lg p-2">
                <h3
                  className={cn(
                    "my-0 rounded-full text-center font-semibold",
                    purchased
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-kfk-red",
                  )}
                >
                  {purchased ? "Purchased" : "Not Purchased"}
                </h3>
                <span className="p-0 font-gaegu text-primary line-clamp-1">
                  {g.title}
                </span>
              </Card>
            );
          })}
        </div>

        <Button
          type="button"
          aria-expanded={detailsOpen}
          className="flex items-center gap-1 rounded-full bg-white px-6 font-gaegu text-lg font-bold text-kfk-blue hover:bg-white/90"
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
