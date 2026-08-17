import { useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  CircleAlertIcon,
  ExternalLink,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ReceiptImageUploadRow } from "./ReceiptImageUploadRow";
import type { CommittedGift, GiftFormState } from "./types";
import { formatUsd } from "./utils";
import { ConfirmGiftsModal } from "@/components/storefront/ConfirmGiftsPopup";
import { getGiftStatusClass, getGiftStatusLabel } from "./homeRouteUtils";
import { CopyButton } from "@/components/ui/copybutton";
import { formatAddress } from "@/components/child-profile/ChildInfo";
import { cn } from "@/lib/utils";

function getDetailGiftStatus(
  state: GiftFormState,
  giftStatus: CommittedGift["status"],
) {
  if (state.delivered) {
    return "DELIVERED";
  }

  if (state.ordered) {
    return "PURCHASED";
  }

  return giftStatus;
}

function isPurchased(status: CommittedGift["status"]) {
  return (
    status === "PURCHASED" || status === "DELIVERED" || status === "RECEIVED"
  );
}

function isDelivered(status: CommittedGift["status"]) {
  return status === "DELIVERED" || status === "RECEIVED";
}

function hasPurchaseConfirmation(
  state: GiftFormState,
  giftStatus: CommittedGift["status"],
) {
  return (
    isPurchased(giftStatus) ||
    !!state.receiptFileName ||
    !!state.receiptPath ||
    !!state.tracking.trim() ||
    !!state.savedTracking.trim()
  );
}

function ConfirmationBadge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex h-10 items-center rounded-[12px] bg-[#148A14] px-4 font-gaegu text-[18px] font-bold text-white shadow-sm">
      {children}
    </div>
  );
}

function ConfirmationButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      className="h-9 rounded-[8px] bg-[#173FB6] px-4 font-gaegu text-[18px] font-bold text-white hover:bg-[#173FB6]/90 disabled:opacity-50"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ConfirmationSection({
  title,
  needsAttention,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  needsAttention: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="group flex h-auto w-full items-center justify-between rounded-none py-4 text-left"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-medium text-[#1F2937]">
              {title}
            </span>
            {needsAttention ? (
              <CircleAlertIcon className="text-kfk-red" />
            ) : null}
          </div>
          <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-6">{children}</CollapsibleContent>
    </Collapsible>
  );
}

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
  onReceipt,
  onDeliveryReceipt,
  onTrackingChange,
  onUnclaimRequest,
  onSave,
  defaultExpanded = true,
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
  onReceipt: (file: File | string | null) => void;
  onDeliveryReceipt: (file: File | string | null) => void;
  onTrackingChange: (value: string) => void;
  onUnclaimRequest: () => void;
  onSave: () => void | Promise<void>;
  defaultExpanded?: boolean;
}) {
  const [cardOpen, setCardOpen] = useState(defaultExpanded);
  const [purchaseOpen, setPurchaseOpen] = useState(defaultExpanded);
  const [deliveryOpen, setDeliveryOpen] = useState(defaultExpanded);
  const [orderConfirmOpen, setOrderConfirmOpen] = useState(false);
  const [deliveryConfirmOpen, setDeliveryConfirmOpen] = useState(false);
  const displayStatus = getDetailGiftStatus(state, gift.status);
  const purchaseConfirmed = hasPurchaseConfirmation(state, gift.status);

  if (state.unclaimed || state.receivedByFamily) {
    return null;
  }

  return (
    <Card className="overflow-hidden rounded-[10px] border border-[#CFCFCF] bg-white shadow-none px-3">
      <Collapsible
        open={cardOpen}
        onOpenChange={setCardOpen}
        className="flex flex-col gap-6"
      >
        <div className="relative px-3 pb-3">
          {/* Overlay trigger so the whole header toggles without nesting the
              link and copy button inside a <button>. */}
          <CollapsibleTrigger
            aria-label={
              cardOpen ? "Collapse gift details" : "Expand gift details"
            }
            className="absolute inset-0 cursor-pointer"
          />
          <div className="pointer-events-none relative">
            <div className="mb-2 flex items-center justify-start">
              <span className={getGiftStatusClass(displayStatus)}>
                {getGiftStatusLabel(displayStatus)}
              </span>
            </div>
            <div className="flex w-full items-start gap-2 text-left">
              <Gift
                className="mt-0.5 size-4 shrink-0 text-[#1D4ED8]"
                strokeWidth={2.2}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={gift.productUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="pointer-events-auto cursor-pointer text-kfk-blue underline text-sm min-w-0"
                  >
                    <div className="min-w-0 text-[15px] font-semibold leading-5">
                      <span className="line-clamp-2">{gift.title}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[13px]">
                      <ExternalLink className="size-3.5" />
                    </div>
                  </a>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[15px] text-[#4B5563]">
                      {formatUsd(gift.listedPrice)}
                    </span>
                    {cardOpen ? (
                      <ChevronUp className="mt-0.5 size-4 shrink-0 text-[#1F2937]" />
                    ) : (
                      <ChevronDown className="mt-0.5 size-4 shrink-0 text-[#1F2937]" />
                    )}
                  </div>
                </div>
                {gift.additionalInfo ? (
                  <p className="mt-2 text-[12px] leading-4 text-[#4B5563]">
                    {gift.additionalInfo}
                  </p>
                ) : null}
                {gift.familyAddress && (
                  <CopyButton
                    text={formatAddress(gift.familyAddress)}
                    className="pointer-events-auto flex items-center w-fit p-2 mt-2 border text-[12px] text-[#4B5563]"
                  >
                    Copy delivery address
                  </CopyButton>
                )}
              </div>
            </div>
          </div>
        </div>

        <CollapsibleContent className="flex flex-col">
          <Separator className="bg-[#E5E7EB]" />

          <ConfirmationSection
            title="Purchase Confirmation"
            needsAttention={!state.ordered}
            open={purchaseOpen}
            onOpenChange={setPurchaseOpen}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="max-w-[120px] text-[14px] leading-5 text-[#4B5563]">
                Did you order the gift?
              </p>
              {purchaseConfirmed ? (
                <ConfirmationBadge>Purchase Confirmed ✓</ConfirmationBadge>
              ) : (
                <ConfirmationButton onClick={() => setOrderConfirmOpen(true)}>
                  Confirm Purchase
                </ConfirmationButton>
              )}
            </div>

            {purchaseConfirmed ? (
              <>
                <p className="mt-8 text-center text-[13px] italic text-[#4B5563]">
                  Optional, but helpful for us!
                </p>
                <div className="mt-3">
                  <ReceiptImageUploadRow
                    label="Attach Receipt"
                    fileName={state.receiptFileName}
                    filePath={state.receiptPath}
                    disabled={!isPurchased(displayStatus)}
                    isUploading={isUploadingReceipt}
                    onFile={onReceipt}
                    onClear={() => onReceipt(null)}
                  />
                </div>
                <div className="mt-4 grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
                  <Label
                    htmlFor={`${gift.id}-tracking`}
                    className="text-[14px] font-normal text-[#4B5563]"
                  >
                    Tracking #
                  </Label>
                  <Input
                    id={`${gift.id}-tracking`}
                    value={state.tracking}
                    onChange={(event) => onTrackingChange(event.target.value)}
                    disabled={isSavingTracking}
                    placeholder="e.g. 732132323213213"
                    className="h-10 rounded-[12px] border-[#BDBDBD] text-[13px]"
                  />
                </div>
                <div className="mt-1 flex items-center justify-end text-[12px] text-[#4B5563]">
                  {state.tracking !== state.savedTracking ? (
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="h-auto p-0 text-[12px] text-kfk-blue underline"
                      onClick={() => onSave()}
                    >
                      Save Tracking
                    </Button>
                  ) : state.changesSaved ? (
                    <span>Changes Saved</span>
                  ) : null}
                </div>
              </>
            ) : null}
          </ConfirmationSection>

          <Separator className="bg-[#E5E7EB]" />

          <ConfirmationSection
            title="Delivery Confirmation"
            needsAttention={state.ordered && !state.delivered}
            open={deliveryOpen}
            onOpenChange={setDeliveryOpen}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="max-w-[120px] text-[14px] leading-5 text-[#4B5563]">
                Was the gift delivered?
              </p>
              {state.delivered ? (
                <ConfirmationBadge>Delivery Confirmed ✓</ConfirmationBadge>
              ) : (
                <ConfirmationButton
                  disabled={!state.ordered}
                  onClick={() => setDeliveryConfirmOpen(true)}
                >
                  Confirm Delivery
                </ConfirmationButton>
              )}
            </div>
            <p
              className={cn(
                "text-center text-[13px] italic text-[#4B5563]",
                state.delivered ? "mt-8" : "mt-4",
              )}
            >
              Optional, but helpful for us!
            </p>
            <div className="mt-3">
              <ReceiptImageUploadRow
                label="Attach Receipt"
                fileName={state.deliveryReceiptFileName}
                filePath={state.deliveryReceiptPath}
                disabled={!isDelivered(displayStatus)}
                isUploading={isUploadingDeliveryReceipt}
                onFile={onDeliveryReceipt}
                onClear={() => onDeliveryReceipt(null)}
              />
            </div>
          </ConfirmationSection>

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="link"
              size="xs"
              className="h-auto p-0 text-[12px] text-[#4B5563] underline underline-offset-2"
              onClick={onUnclaimRequest}
            >
              Unclaim gift
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <ConfirmGiftsModal
        isOpen={orderConfirmOpen}
        onClose={() => setOrderConfirmOpen(false)}
        onConfirm={async () => {
          await onOrdered();
          setOrderConfirmOpen(false);
        }}
        isLoading={isOrdering}
        title="Are you sure you want to confirm your gift purchase?"
        confirmLabel="Yes, I am sure!"
      />
      <ConfirmGiftsModal
        isOpen={deliveryConfirmOpen}
        onClose={() => setDeliveryConfirmOpen(false)}
        onConfirm={async () => {
          await onDelivered();
          setDeliveryConfirmOpen(false);
        }}
        isLoading={isDelivering}
        title="Are you sure you want to confirm the gift was delivered?"
        confirmLabel="Yes, I am sure!"
      />
    </Card>
  );
}
