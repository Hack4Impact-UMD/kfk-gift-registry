import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ReceiptImageUploadRow } from "./ReceiptImageUploadRow";
import type { CommittedGift, GiftFormState } from "./types";
import { formatUsd } from "./utils";
import { ConfirmGiftsModal } from "@/components/storefront/ConfirmGiftsPopup";
import { getGiftStatusClass, getGiftStatusLabel } from "./homeRouteUtils";

export function DetailGiftCard({
  gift,
  state,
  isOrdering,
  isDelivering,
  isSavingTracking,
  isUploadingReceipt,
  isUploadingDeliveryReceipt,
  onOrdered,
  onDelivered,
  onUndoDelivery,
  onReceipt,
  onDeliveryReceipt,
  onTrackingChange,
  onUnclaimRequest,
  onSave,
}: {
  gift: CommittedGift;
  state: GiftFormState;
  isOrdering: boolean;
  isDelivering: boolean;
  isSavingTracking: boolean;
  isUploadingReceipt: boolean;
  isUploadingDeliveryReceipt: boolean;
  onOrdered: () => void | Promise<void>;
  onDelivered: () => void | Promise<void>;
  onUndoDelivery: () => void;
  onReceipt: (file: File | string | null) => void;
  onDeliveryReceipt: (file: File | string | null) => void;
  onTrackingChange: (value: string) => void;
  onUnclaimRequest: () => void;
  onSave: () => void | Promise<void>;
}) {
  const [purchaseOpen, setPurchaseOpen] = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(true);
  const [orderConfirmOpen, setOrderConfirmOpen] = useState(false);
  const [deliveryConfirmOpen, setDeliveryConfirmOpen] = useState(false);

  if (state.unclaimed || state.receivedByFamily) {
    return null;
  }

  return (
    <Card className="overflow-hidden rounded-[10px] border border-[#CFCFCF] bg-white shadow-none">
      <div className="px-3 pb-3 pt-2">
        <div className="mb-2 flex items-center justify-start">
          <span className={getGiftStatusClass(gift.status)}>
            {getGiftStatusLabel(gift.status)}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <Gift className="mt-0.5 size-4 shrink-0 text-[#1D4ED8]" strokeWidth={2.2} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <a
                href={gift.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 text-[15px] font-semibold leading-5 text-[#1F2937]"
              >
                <span className="line-clamp-2">{gift.title}</span>
              </a>
              <span className="shrink-0 text-[15px] text-[#4B5563]">
                {formatUsd(gift.listedPrice)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[13px] text-[#4B5563]">
              <ExternalLink className="size-3.5" />
            </div>
            {gift.additionalInfo ? (
              <p className="mt-2 text-[12px] leading-4 text-[#4B5563]">
                {gift.additionalInfo}
              </p>
            ) : null}
            <button type="button" className="mt-2 text-[12px] text-[#4B5563]">
              Copy delivery address ⧉
            </button>
          </div>
        </div>

        <Separator className="my-3 bg-[#E5E7EB]" />

        <div>
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setPurchaseOpen((prev) => !prev)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-medium text-[#1F2937]">
                Purchase Confirmation
              </span>
              {!state.ordered ? <span className="text-[#EF4444]">❗</span> : null}
            </div>
            {purchaseOpen ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {purchaseOpen ? (
            <div className="pt-4">
              {!state.ordered ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="max-w-[120px] text-[14px] leading-5 text-[#4B5563]">
                    Did you order the gift?
                  </p>
                  <Button
                    type="button"
                    className="h-9 rounded-[8px] bg-[#173FB6] px-4 font-gaegu text-[18px] font-bold text-white hover:bg-[#173FB6]/90"
                    onClick={() => setOrderConfirmOpen(true)}
                  >
                    Confirm Purchase
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-center text-[13px] italic text-[#4B5563]">
                    Optional, but helpful for us!
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Label className="text-[14px] text-[#4B5563]">
                      Attach Receipt
                    </Label>
                    <ReceiptImageUploadRow
                      fileName={state.receiptFileName}
                      filePath={state.receiptPath}
                      disabled={false}
                      isUploading={isUploadingReceipt}
                      onFile={onReceipt}
                      onClear={() => onReceipt(null)}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Label
                      htmlFor={`${gift.id}-tracking`}
                      className="w-12 text-[14px] text-[#4B5563]"
                    >
                      Tracking #
                    </Label>
                    <Input
                      id={`${gift.id}-tracking`}
                      value={state.tracking}
                      onChange={(event) => onTrackingChange(event.target.value)}
                      disabled={isSavingTracking}
                      placeholder="e.g. 732132323213213"
                      className="h-9 rounded-[8px] border-[#BDBDBD] text-[13px]"
                    />
                  </div>
                  <div className="mt-1 flex justify-end">
                    <span className="text-[12px] text-[#4B5563]">
                      {state.tracking !== state.savedTracking ? (
                        <button
                          type="button"
                          className="text-kfk-blue underline"
                          onClick={() => onSave()}
                        >
                          Save Tracking
                        </button>
                      ) : state.changesSaved ? (
                        "Changes Saved"
                      ) : null}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        <Separator className="my-3 bg-[#E5E7EB]" />

        <div>
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setDeliveryOpen((prev) => !prev)}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-medium text-[#1F2937]">
                Delivery Confirmation
              </span>
              {state.ordered && !state.delivered ? (
                <span className="text-[#EF4444]">❗</span>
              ) : null}
            </div>
            {deliveryOpen ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {deliveryOpen ? (
            <div className="pt-4">
              {!state.delivered ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="max-w-[120px] text-[14px] leading-5 text-[#4B5563]">
                      Was the gift delivered?
                    </p>
                    <Button
                      type="button"
                      disabled={!state.ordered}
                      className="h-9 rounded-[8px] bg-[#173FB6] px-4 font-gaegu text-[18px] font-bold text-white hover:bg-[#173FB6]/90 disabled:opacity-50"
                      onClick={() => setDeliveryConfirmOpen(true)}
                    >
                      Confirm Delivery
                    </Button>
                  </div>
                  <p className="mt-4 text-center text-[13px] italic text-[#4B5563]">
                    Optional, but helpful for us!
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Label className="text-[14px] text-[#4B5563]">
                      Attach Receipt
                    </Label>
                    <ReceiptImageUploadRow
                      fileName={state.deliveryReceiptFileName}
                      filePath={state.deliveryReceiptPath}
                      disabled={!state.ordered}
                      isUploading={isUploadingDeliveryReceipt}
                      onFile={onDeliveryReceipt}
                      onClear={() => onDeliveryReceipt(null)}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] text-[#2E7D32]">
                    Delivery confirmed
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-[8px] border-[#173FB6] px-3 text-[12px] text-[#173FB6]"
                    onClick={onUndoDelivery}
                  >
                    Undo
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onUnclaimRequest}
            className="text-[12px] text-[#4B5563] underline underline-offset-2"
          >
            Unclaim gift
          </button>
        </div>
      </div>

      <ConfirmGiftsModal
        isOpen={orderConfirmOpen}
        onClose={() => setOrderConfirmOpen(false)}
        onConfirm={async () => {
          await onOrdered();
          setOrderConfirmOpen(false);
        }}
        isLoading={isOrdering}
        title="Are you sure you ordered this gift?"
        description="You cannot undo this once you click confirm."
        confirmLabel="Yes, I ordered it!"
      />
      <ConfirmGiftsModal
        isOpen={deliveryConfirmOpen}
        onClose={() => setDeliveryConfirmOpen(false)}
        onConfirm={async () => {
          await onDelivered();
          setDeliveryConfirmOpen(false);
        }}
        isLoading={isDelivering}
        title="Are you sure this gift was delivered?"
        description="You cannot undo this once you click confirm."
        confirmLabel="Yes, it was delivered!"
      />
    </Card>
  );
}
