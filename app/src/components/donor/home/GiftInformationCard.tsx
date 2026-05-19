import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ConfirmedBanner } from "./ConfirmedBanner";
import { FileUploadRow } from "./FileUploadRow";
import type { CommittedGift, GiftFormState } from "./types";
import { formatUsd } from "./utils";
import { ConfirmGiftsModal } from "@/components/storefront/ConfirmGiftsPopup";

export function GiftInformationCard({
  gift,
  state,
  isOrdering = false,
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
  isOrdering?: boolean;
  onOrdered: () => void;
  onDelivered: () => void;
  onUndoDelivery: () => void;
  onReceipt: (f: string | null) => void;
  onDeliveryReceipt: (f: string | null) => void;
  onTrackingChange: (v: string) => void;
  onUnclaimRequest: () => void;
  onSave: () => void;
}) {
  const [undoMode, setUndoMode] = useState(false);
  const [orderConfirmOpen, setOrderConfirmOpen] = useState(false);

  // Keeps track of the most recent saved states
  const [trackingNum, setTrackingNum] = useState(state.tracking);
  const [isDelivered, setIsDelivered] = useState(state.delivered);
  const [orderReceipt, setOrderReceipt] = useState(state.receiptFileName);
  const [orderDeliveryReceipt, setOrderDeliveryReceipt] = useState(
    state.deliveryReceiptFileName,
  );

  const handleConfirmOrdered = () => {
    onOrdered();
    setOrderConfirmOpen(false);
  };

  if (state.receivedByFamily || state.unclaimed) return null;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all",
        "text-gray-900",
        undoMode && "ring-4 ring-amber-400 ring-offset-1",
      )}
    >
      <div className="space-y-4 p-4 md:p-5">
        <div className="rounded-xl bg-slate-50 p-4">
          <dl className="grid gap-x-4 gap-y-3 text-sm">
            <dt className="shrink-0 font-bold">Gift Name</dt>
            <dd className="min-w-0">
              <a
                href={gift.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-1.5 font-medium text-kfk-blue hover:underline"
              >
                <span className="break-words">{gift.title}</span>
                <ExternalLink
                  className="size-4 shrink-0 translate-y-px"
                  aria-hidden
                />
              </a>
            </dd>
            <dt className="shrink-0 font-bold">Price</dt>
            <dd>{formatUsd(gift.listedPrice)}</dd>
            <dt className="shrink-0 font-bold">Additional Information</dt>
            <dd className="text-gray-800">{gift.additionalInfo}</dd>
          </dl>
        </div>

        {undoMode && (
          <p className="text-center text-sm font-medium text-gray-700">
            Select necessary button(s) to undo or edit any unintended actions.
          </p>
        )}

        {state.ordered && (
          <div className="space-y-4 rounded-lg border-2 border-kfk-blue bg-white p-4">
            {!state.delivered ? (
              <>
                <p className="text-center text-base font-medium text-gray-900">
                  Was the gift delivered?
                </p>
                <div className="flex w-full justify-center">
                  <Button
                    type="button"
                    className="h-12 w-[92%] max-w-md rounded-xl bg-kfk-blue font-gaegu text-[20px] font-bold text-white hover:bg-kfk-blue/80"
                    onClick={() => {
                      onDelivered();
                      if (!undoMode) {
                        setIsDelivered(true);
                        onSave();
                      }
                    }}
                  >
                    Yes, it was delivered!
                  </Button>
                </div>
              </>
            ) : undoMode ? (
              // In undo mode: show undo button instead of confirmed banner
              <div className="flex w-full justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-[92%] max-w-md rounded-xl border-2 border-kfk-blue font-gaegu text-[18px] font-bold text-kfk-blue hover:bg-kfk-blue/10"
                  onClick={() => {
                    onUndoDelivery();
                  }}
                >
                  Undo Delivery Confirmation
                </Button>
                {state.pendingUnclaim && (
                  <p className="text-center text-xs text-amber-600 font-medium">
                    Un-claim pending — save to confirm
                  </p>
                )}
              </div>
            ) : (
              <ConfirmedBanner label="Gift Delivery Confirmed" />
            )}

            <Separator className="bg-gray-200" />
            <p className="text-center text-base text-gray-700">
              Optional, but helpful for us!
            </p>
            <FileUploadRow
              fileName={state.deliveryReceiptFileName}
              onFile={(n) => {
                onDeliveryReceipt(n);
                if (!undoMode) {
                  onSave();
                  setOrderDeliveryReceipt(n);
                }
              }}
              onClear={() => onDeliveryReceipt(null)}
              showClear={undoMode}
            />
          </div>
        )}

        <div className="space-y-4 rounded-lg border-2 border-kfk-blue bg-white p-4">
          {!state.ordered ? (
            <>
              <p className="text-center text-base font-medium text-gray-900">
                Did you order the gift?
              </p>
              <div className="flex w-full justify-center">
                <Button
                  type="button"
                  className="h-12 w-[92%] max-w-md rounded-xl bg-kfk-blue font-gaegu text-[20px] font-bold text-white hover:bg-kfk-blue/80"
                  onClick={() => setOrderConfirmOpen(true)}
                >
                  Yes, I ordered the gift!
                </Button>
              </div>
            </>
          ) : undoMode ? (
            // In undo mode: show un-claim button instead of confirmed banner
            <div className="flex w-full justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-[92%] max-w-md rounded-xl border-2 border-kfk-blue font-gaegu text-[18px] font-bold text-kfk-blue hover:bg-kfk-blue/10"
                onClick={onUnclaimRequest}
              >
                Un-Claim Gift
              </Button>
            </div>
          ) : (
            <ConfirmedBanner label="Gift Purchase Confirmed" />
          )}

          <Separator className="bg-gray-200" />
          <p className="text-center text-base text-gray-700">
            Optional, but helpful for us!
          </p>
          <FileUploadRow
            fileName={state.receiptFileName}
            onFile={(n) => {
              onReceipt(n);
              if (!undoMode) {
                onSave();
                setOrderReceipt(n);
              }
            }}
            onClear={() => onReceipt(null)}
            showClear={undoMode}
          />

          <div className="flex flex-row justify-between gap-2">
            <Label
              htmlFor={`${gift.id}-tracking`}
              className="text-sm font-bold whitespace-nowrap text-gray-900"
            >
              Tracking #
            </Label>
            {!state.ordered || undoMode ? (
              <Input
                id={`${gift.id}-tracking`}
                value={state.tracking}
                onChange={(e) => onTrackingChange(e.target.value)}
                placeholder="Enter tracking number"
                className="rounded-lg border-gray-300"
              />
            ) : (
              <Label className="justify-self-end text-primary">
                {state.tracking}
              </Label>
            )}
          </div>

          {/* Changes Saved */}
          {state.changesSaved && !undoMode && (
            <div className="flex justify-end">
              <span className="text-xs text-gray-500">Changes Saved</span>
            </div>
          )}
        </div>

        {!undoMode ? (
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setUndoMode(true)}
            >
              Undo Actions
            </Button>
          </div>
        ) : (
          <div className="flex justify-between pt-1">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                if (isDelivered) onDelivered();
                else onUndoDelivery();
                onTrackingChange(trackingNum);
                onReceipt(orderReceipt);
                onDeliveryReceipt(orderDeliveryReceipt);
                onSave();
                setUndoMode(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-kfk-blue font-medium text-white hover:bg-kfk-blue/80"
              onClick={() => {
                onSave();
                setUndoMode(false);
                setIsDelivered(state.delivered);
                setTrackingNum(state.tracking);
                setOrderReceipt(state.receiptFileName);
                setOrderDeliveryReceipt(state.deliveryReceiptFileName);
              }}
            >
              Save
            </Button>
          </div>
        )}
      </div>

      <ConfirmGiftsModal
        isOpen={orderConfirmOpen}
        onClose={() => setOrderConfirmOpen(false)}
        onConfirm={handleConfirmOrdered}
        isLoading={isOrdering}
        title="Are you sure you ordered this gift?"
        confirmLabel="Yes, I ordered it!"
      />
    </div>
  );
}
