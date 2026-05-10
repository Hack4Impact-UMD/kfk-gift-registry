import { useEffect } from "react";
import { Gift } from "lucide-react";
import type { CommittedChild, GiftFormState } from "./types";
import { GiftInformationCard } from "./GiftInformationCard";
import { ReceivedGiftsCard } from "./ReceivedGiftsCard";

export function ChildDetailSection({
  child,
  giftStates,
  onOrdered,
  onDelivered,
  onUndoDelivery,
  onReceipt,
  onDeliveryReceipt,
  onTrackingChange,
  onUnclaimRequest,
  onSave,
}: {
  child: CommittedChild;
  giftStates: Record<string, GiftFormState>;
  onOrdered: (id: string) => void;
  onDelivered: (id: string) => void;
  onUndoDelivery: (id: string) => void;
  onReceipt: (id: string, f: string | null) => void;
  onDeliveryReceipt: (id: string, f: string | null) => void;
  onTrackingChange: (id: string, v: string) => void;
  onUnclaimRequest: (id: string) => void;
  onSave: (id: string) => void;
}) {
  useEffect(() => {
    const element = document.getElementById(`${child.id}-gift`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [child.id]);

  return (
    <div className="mt-2 flex flex-col gap-4 text-left">
      <div
        id={`${child.id}-gift`}
        className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 items-center justify-center gap-2 bg-kfk-blue py-3 px-4 text-white"
      >
        <Gift className="size-5 shrink-0" strokeWidth={1.75} />
        <span className="text-sm font-semibold md:text-base">
          {child.firstName}&apos;s Gift Information
        </span>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-6">
        <ReceivedGiftsCard gifts={child.gifts} giftStates={giftStates} />
        {[...child.gifts]
          .sort((a, b) => {
            const aDone = giftStates[a.id]?.ordered ?? false;
            const bDone = giftStates[b.id]?.ordered ?? false;
            if (aDone !== bDone) return aDone ? 1 : -1;
            return (
              child.gifts.findIndex((x) => x.id === a.id) -
              child.gifts.findIndex((x) => x.id === b.id)
            );
          })
          .map((gift) => (
            <GiftInformationCard
              key={gift.id}
              gift={gift}
              state={giftStates[gift.id]}
              onOrdered={() => onOrdered(gift.id)}
              onDelivered={() => onDelivered(gift.id)}
              onUndoDelivery={() => onUndoDelivery(gift.id)}
              onReceipt={(f) => onReceipt(gift.id, f)}
              onDeliveryReceipt={(f) => onDeliveryReceipt(gift.id, f)}
              onTrackingChange={(v) => onTrackingChange(gift.id, v)}
              onUnclaimRequest={() => onUnclaimRequest(gift.id)}
              onSave={() => onSave(gift.id)}
            />
          ))}
      </div>
    </div>
  );
}
