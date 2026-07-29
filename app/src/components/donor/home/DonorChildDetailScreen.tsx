import { ChevronLeft, ChevronUp, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UnclaimDialog } from "./UnclaimDialog";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { DetailGiftCard } from "./DetailGiftCard";
import { ReceivedSummaryCard } from "./ReceivedSummaryCard";
import { HaveQuestionDialog } from "./HaveQuestionDialog";
import type { DonorHomeChild } from "./homeRouteTypes";
import { useDonorChildDetailState } from "./useDonorChildDetailState";

export function DonorChildDetailScreen({
  child,
  childIndex,
  totalChildren,
  onBack,
  onNavigateChild,
}: {
  child: DonorHomeChild;
  childIndex: number;
  totalChildren: number;
  onBack: () => void;
  onNavigateChild: (nextIndex: number) => void;
}) {
  const {
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
    handleReceipt,
    handleDeliveryReceipt,
    handleTrackingChange,
    handleSave,
    handleUnclaimConfirm,
  } = useDonorChildDetailState(child);

  const prevDisabled = childIndex <= 0;
  const nextDisabled = childIndex >= totalChildren - 1;

  return (
    <div className="mx-auto w-full max-w-[430px] px-2 pb-8 pt-1 text-[#1F2937]">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[14px] text-[#1F2937]"
      >
        <ChevronLeft className="size-4" />
        <span>Back to Home</span>
      </button>

      <div className="mt-3 overflow-hidden rounded-[4px] border border-[#D1D5DB] bg-white">
        <div className="flex items-center justify-center gap-2 bg-[#173FB6] px-4 py-2 text-white">
          <Gift className="size-4" />
          <span className="text-[13px] font-medium">
            {child.firstName}&apos;s Gift Commitments
          </span>
        </div>

        <div className="px-3 py-3">
          <div className="flex items-start gap-3">
            <img
              src={child.photoUrl}
              alt={`${child.firstName} ${child.lastName}`.trim()}
              className="h-[54px] w-[54px] rounded-full object-cover ring-2 ring-[#8BC34A]"
            />
            <div>
              <h1 className="font-gaegu text-[28px] font-bold leading-none text-[#1F2937]">
                {`${child.firstName} ${child.lastName}`.trim()}
              </h1>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold leading-none",
                  child.category === "Warrior"
                    ? "bg-[#FFF1B8] text-[#8A5A00]"
                    : "bg-[#D4EAFF] text-[#1D4ED8]",
                )}
              >
                {child.category === "Supersib" ? "Super Sib" : child.category}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-kfk-blue">
            <button type="button" className="font-medium text-[14px]">
              Collapse All
            </button>
            <ChevronUp className="size-4" />
          </div>

          <div className="mt-2 space-y-2">
            {visibleGifts.map((gift) => (
              <DetailGiftCard
                key={gift.id}
                gift={gift}
                state={giftStates[gift.id]}
                isOrdering={markGiftPurchased.isPending}
                isDelivering={markGiftDelivered.isPending}
                isSavingTracking={updateGiftTrackingNumber.isPending}
                isUploadingReceipt={uploadPurchaseReceipt.isPending}
                isUploadingDeliveryReceipt={uploadDeliveryReceipt.isPending}
                onOrdered={() => handleOrdered(gift.id)}
                onDelivered={() => handleDelivered(gift.id)}
                onReceipt={(file) => handleReceipt(gift.id, file)}
                onDeliveryReceipt={(file) => handleDeliveryReceipt(gift.id, file)}
                onTrackingChange={(value) => handleTrackingChange(gift.id, value)}
                onUnclaimRequest={() => setUnclaimTargetId(gift.id)}
                onSave={() => handleSave(gift.id)}
              />
            ))}

            {receivedGifts.length > 0 ? (
              <ReceivedSummaryCard
                gifts={receivedGifts}
                childFirstName={child.firstName}
              />
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              type="button"
              disabled={prevDisabled || !allSaved}
              className="h-9 rounded-full bg-[#173FB6] px-4 font-gaegu text-[18px] font-bold text-white hover:bg-[#173FB6]/90 disabled:opacity-50"
              onClick={() => onNavigateChild(childIndex - 1)}
            >
              ‹ Prev. Child
            </Button>
            <Button
              type="button"
              disabled={nextDisabled || !allSaved}
              className="h-9 rounded-full bg-[#173FB6] px-4 font-gaegu text-[18px] font-bold text-white hover:bg-[#173FB6]/90 disabled:opacity-50"
              onClick={() => onNavigateChild(childIndex + 1)}
            >
              Next Child ›
            </Button>
          </div>

          <div className="mt-5 text-center">
            <HaveQuestionDialog />
          </div>
        </div>
      </div>

      <UnclaimDialog
        open={unclaimTargetId !== null}
        onCancel={() => setUnclaimTargetId(null)}
        onConfirm={handleUnclaimConfirm}
      />

      <UnsavedChangesDialog
        open={false}
        onDiscard={() => undefined}
        onSave={() => undefined}
      />
    </div>
  );
}
