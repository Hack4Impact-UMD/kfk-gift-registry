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
    <div className="inline-flex h-10 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-[12px] bg-[#148A14] px-4 font-gaegu sm:w-auto text-[20px] font-bold text-white shadow-sm">
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
      className="h-10 w-full shrink-0 whitespace-nowrap rounded-[12px] bg-[#173FB6] px-4 font-gaegu sm:w-auto text-[20px] font-bold text-white hover:bg-[#173FB6]/90 disabled:opacity-50"
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
          className="group -mx-4 flex h-auto w-[calc(100%+2rem)] items-center justify-between rounded-none px-4 py-3.5 text-left"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[16px] font-medium text-[#1F2937]">
              {title}
            </span>
            {needsAttention ? (
              <CircleAlertIcon className="size-4 text-kfk-red" />
            ) : null}
          </div>
          <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-5 pt-1">{children}</CollapsibleContent>
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
    <Card
      data-testid={`donor-gift-${gift.id}`}
      className="gap-0 overflow-hidden rounded-[10px] border border-[#CFCFCF] bg-white px-4 py-0 shadow-none"
    >
      <Collapsible
        open={cardOpen}
        onOpenChange={setCardOpen}
        className="flex flex-col"
      >
        <div className="relative py-4">
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
                    className="pointer-events-auto flex min-w-0 cursor-pointer items-start gap-1 text-[17px] font-semibold leading-6 text-kfk-blue underline"
                  >
                    <span className="line-clamp-2">{gift.title}</span>
                    <ExternalLink className="mt-1 size-4 shrink-0" />
                  </a>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-[17px] leading-6 text-[#4B5563]">
                      {formatUsd(gift.listedPrice)}
                    </span>
                    {cardOpen ? (
                      <ChevronUp className="mt-1 size-4 shrink-0 text-[#1F2937]" />
                    ) : (
                      <ChevronDown className="mt-1 size-4 shrink-0 text-[#1F2937]" />
                    )}
                  </div>
                </div>
                {gift.additionalInfo ? (
                  <p className="mt-1.5 text-[14px] leading-5 text-[#4B5563]">
                    {gift.additionalInfo}
                  </p>
                ) : null}
                {gift.familyAddress && (
                  <div className="mt-3 flex flex-col gap-0.5">
                    <p className="text-[13px] font-semibold leading-5 text-[#4B5563]">
                      Delivery Address
                    </p>
                    <p className="text-base leading-6 text-[#1F2937]">
                      {formatAddress(gift.familyAddress)}
                    </p>
                    <CopyButton
                      text={formatAddress(gift.familyAddress)}
                      ariaLabel="Copy delivery address"
                      className="pointer-events-auto mt-2 flex w-fit items-center border p-2 text-[14px] text-[#4B5563]"
                    >
                      Copy delivery address
                    </CopyButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <CollapsibleContent className="flex flex-col">
          <Separator className="-mx-4 bg-[#E5E7EB] data-[orientation=horizontal]:w-auto" />

          <ConfirmationSection
            title="Purchase Confirmation"
            needsAttention={!state.ordered}
            open={purchaseOpen}
            onOpenChange={setPurchaseOpen}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="text-[16px] leading-6 text-[#4B5563] sm:w-[128px] sm:shrink-0">
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
                <p className="mt-5 text-center text-[14px] italic text-[#4B5563]">
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
                <div className="mt-3 flex flex-col gap-2 sm:grid sm:grid-cols-[128px_minmax(0,1fr)] sm:items-center sm:gap-3">
                  <Label
                    htmlFor={`${gift.id}-tracking`}
                    className="text-[16px] font-normal text-[#4B5563]"
                  >
                    Tracking #
                  </Label>
                  <Input
                    id={`${gift.id}-tracking`}
                    value={state.tracking}
                    onChange={(event) => onTrackingChange(event.target.value)}
                    disabled={isSavingTracking}
                    placeholder="e.g. 732132323213213"
                    className="h-10 rounded-[12px] border-[#BDBDBD] text-[15px]"
                  />
                </div>
                <div className="mt-1 flex items-center justify-end text-[14px] text-[#4B5563]">
                  {state.tracking !== state.savedTracking ? (
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="h-auto p-0 text-[14px] text-kfk-blue underline"
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

          <Separator className="-mx-4 bg-[#E5E7EB] data-[orientation=horizontal]:w-auto" />

          <ConfirmationSection
            title="Delivery Confirmation"
            needsAttention={state.ordered && !state.delivered}
            open={deliveryOpen}
            onOpenChange={setDeliveryOpen}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="text-[16px] leading-6 text-[#4B5563] sm:w-[128px] sm:shrink-0">
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
            <p className="mt-5 text-center text-[14px] italic text-[#4B5563]">
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

          <div className="flex justify-end pb-4">
            <Button
              type="button"
              variant="link"
              size="xs"
              className="h-auto p-0 text-[14px] text-[#4B5563] underline underline-offset-2"
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
