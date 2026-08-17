import { useRef, useState, useTransition } from "react";
import { useStorageUrl } from "@/hooks/useStorageUrl";
import type { ChangeEvent } from "react";
import type { Transaction } from "@tanstack/react-db";
import { useQueryClient } from "@tanstack/react-query";
import type { Gift, GiftStatus } from "common";
import {
  GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE,
  GIFT_TITLE_TOO_LONG_MESSAGE,
  MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH,
  MAX_GIFT_TITLE_LENGTH,
  isGiftFamilyPublicNotesTooLong,
  isGiftTitleTooLong,
} from "common";
import { useCollections } from "@/collections/context";
import { queries } from "@/queries";
import type { GiftClaimDetails } from "@/server/functions/child";
import { updateClaimTrackingNumber } from "@/server/functions/child";
import { toast } from "@/lib/toast";
import { formatISODate } from "@/lib/utils";
import { e164ToDisplay } from "@/components/ui/phone-input";
import { EditableField } from "@/components/review/EditableField";
import { Button } from "@/components/ui/button";

const GIFT_STEPS = [
  "Available",
  "Claimed",
  "Purchased",
  "Delivered",
  "Received",
];
const GIFT_STATUS_ORDER: Array<GiftStatus> = [
  "AVAILABLE",
  "CLAIMED",
  "PURCHASED",
  "DELIVERED",
  "RECEIVED",
];

const TRACK_START = 10;
const TRACK_WIDTH = 80;

function GiftProgressBar({ status }: { status: GiftStatus }) {
  const currentStep = GIFT_STATUS_ORDER.indexOf(status);
  const filledTo = currentStep >= 0 ? currentStep + 1 : 0;

  const fillWidthPercent =
    filledTo > 0 ? TRACK_WIDTH * ((filledTo - 1) / (GIFT_STEPS.length - 1)) : 0;

  const progressColor =
    status === "RECEIVED" ? "bg-kfk-green" : "bg-kfk-yellow";
  const progressBorderColor =
    status === "RECEIVED" ? "border-kfk-green" : "border-kfk-yellow";

  return (
    <div className="mb-3 mt-5 w-full overflow-x-auto font-bold font-gaegu">
      <div className="min-w-[480px]">
        <div className="relative flex h-8 w-full items-center">
          <div
            className={`absolute h-[10px] rounded-full border-2 ${progressBorderColor}`}
            style={{ left: `${TRACK_START}%`, width: `${TRACK_WIDTH}%` }}
          />
          <div
            className={`absolute h-[10px] rounded-full ${progressColor}`}
            style={{ left: `${TRACK_START}%`, width: `${fillWidthPercent}%` }}
          />
          <div className="relative z-10 flex w-full">
            {GIFT_STEPS.map((_, i) => {
              const isComplete = i < filledTo;
              return (
                <div key={i} className="flex flex-1 justify-center">
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                      isComplete
                        ? `text-white ${progressColor}`
                        : `border-2 ${progressBorderColor} bg-white`,
                    ].join(" ")}
                  >
                    {i + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-1 flex w-full">
          {GIFT_STEPS.map((label) => (
            <div key={label} className="flex-1 text-center text-xs">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface GiftInfoCardProps {
  gift: Gift;
  isBackupGift?: boolean;
  claim?: GiftClaimDetails;
}

export function GiftInfoCard({ gift, claim }: GiftInfoCardProps) {
  const collections = useCollections();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const txRef = useRef<Transaction<Gift> | null>(null);
  const [draftTrackingId, setDraftTrackingId] = useState("");
  const trackingIdBeforeEdit = useRef(claim?.trackingNumber ?? "");

  const editField = <K extends keyof Gift>(key: K, value: Gift[K]) => {
    if (!txRef.current) {
      txRef.current = collections.createGiftsTransaction();
    }
    const tx = txRef.current;
    tx.mutate(() => {
      collections.gifts.update(gift.id, (draft) => {
        draft[key] = value;
      });
    });
  };

  const handleEditStart = () => {
    const currentTrackingId = claim?.trackingNumber ?? "";
    trackingIdBeforeEdit.current = currentTrackingId;
    setDraftTrackingId(currentTrackingId);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (isGiftTitleTooLong(gift.title)) {
      toast.error(GIFT_TITLE_TOO_LONG_MESSAGE);
      return;
    }

    if (isGiftFamilyPublicNotesTooLong(gift.familyPublicNotes)) {
      toast.error(GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE);
      return;
    }

    const tx = txRef.current;
    const trackingChanged = draftTrackingId !== trackingIdBeforeEdit.current;
    const hasGiftMutations = !!tx && tx.mutations.length > 0;

    if (!hasGiftMutations && !trackingChanged) {
      txRef.current = null;
      setIsEditing(false);
      return;
    }

    startSaveTransition(async () => {
      try {
        await Promise.all([
          hasGiftMutations && tx ? tx.commit() : undefined,
          trackingChanged && claim?.claimId
            ? updateClaimTrackingNumber({
                data: {
                  claimId: claim.claimId,
                  trackingNumber: draftTrackingId,
                },
              }).then(() =>
                queryClient.invalidateQueries({
                  queryKey: queries.claims.byChildId(gift.childId).queryKey,
                }),
              )
            : undefined,
        ]);
        txRef.current = null;
        toast.success("Gift updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error("Gift info save failed", error);
      }
    });
  };

  const handleCancel = () => {
    if (txRef.current && txRef.current.state === "pending") {
      txRef.current.rollback();
    }
    txRef.current = null;
    setDraftTrackingId(trackingIdBeforeEdit.current);
    setIsEditing(false);
  };

  const trackingEditable = isEditing && !!claim?.claimId;
  const purchaseProofUrl = useStorageUrl(claim?.proofOfPurchasePath ?? null);
  const deliveryProofUrl = useStorageUrl(claim?.proofOfDeliveryPath ?? null);

  return (
    <div className="space-y-4 px-6 py-5 text-sm">
      <div className="w-full overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex flex-col gap-4 bg-[#F6F9FC] px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <EditableField
              value={gift.title}
              editable={isEditing}
              characterLimit={MAX_GIFT_TITLE_LENGTH}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                editField("title", event.target.value)
              }
              className="text-lg font-medium"
            >
              Gift Name:
            </EditableField>

            <EditableField
              value={gift.productUrl}
              editable={isEditing}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                editField("productUrl", event.target.value)
              }
              className="text-sm text-kfk-blue"
            >
              Gift Link:
            </EditableField>

            <EditableField
              value={
                isEditing
                  ? (gift.listedPrice ?? "")
                  : gift.listedPrice != null
                    ? `$${gift.listedPrice.toFixed(2)}`
                    : "N/A"
              }
              editable={isEditing}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const nextValue =
                  event.target.value === ""
                    ? undefined
                    : Number(event.target.value);

                editField("listedPrice", nextValue);
              }}
            >
              Price:
            </EditableField>

            <EditableField
              value={gift.familyPublicNotes ?? ""}
              editable={isEditing}
              fieldType="textarea"
              characterLimit={MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH}
              placeholder="N/A"
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                editField("familyPublicNotes", event.target.value)
              }
            >
              Note to Donors:
            </EditableField>
          </div>

          <div className="flex w-full flex-col gap-2 lg:w-auto lg:items-end">
            {!isEditing ? (
              <Button
                size="sm"
                onClick={handleEditStart}
                className="w-full bg-kfk-blue text-white sm:w-auto"
              >
                Edit
              </Button>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="w-full sm:w-auto"
                  size="sm"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  size="sm"
                  variant="destructive"
                  disabled={isSaving}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            )}

            {isEditing && (
              <EditableField
                value={gift.status}
                editable
                fieldType="select"
                selectOptions={GIFT_STATUS_ORDER}
                onChange={(value: string) => {
                  const nextStatus = GIFT_STATUS_ORDER.find(
                    (status) => status === value,
                  );

                  if (nextStatus) {
                    editField("status", nextStatus);
                  }
                }}
              >
                Status:
              </EditableField>
            )}
          </div>
        </div>

        <div className="bg-white px-6 py-6">
          {!isEditing && <GiftProgressBar status={gift.status} />}
        </div>

        <div className="space-y-4 bg-[#F6F9FC] px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <EditableField
              className="w-full"
              value={claim?.donorName ?? "N/A"}
              editable={false}
            >
              Donor:
            </EditableField>

            <EditableField
              className="w-full"
              value={claim?.donorEmail ?? "N/A"}
              editable={false}
            >
              Donor Email:
            </EditableField>

            <EditableField
              className="w-full"
              value={claim?.donorPhone ? e164ToDisplay(claim.donorPhone) : "N/A"}
              editable={false}
            >
              Donor Phone:
            </EditableField>
          </div>

          <EditableField
            value={
              trackingEditable
                ? draftTrackingId
                : claim?.trackingNumber?.trim() || "N/A"
            }
            editable={trackingEditable}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDraftTrackingId(event.target.value)
            }
          >
            Tracking ID:
          </EditableField>
        </div>

        <div className="space-y-3 bg-white px-6 py-5">
          <EditableField
            value={formatISODate(claim?.dateOrdered ?? null)}
            editable={false}
            className="text-base"
          >
            Date Ordered (Confirmed by Donor):
          </EditableField>

          {purchaseProofUrl ? (
            <Button asChild className="h-11 w-full font-gaegu font-bold">
              <a
                href={purchaseProofUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Donor Proof of Purchase
              </a>
            </Button>
          ) : (
            <Button
              className="h-11 w-full bg-gray-300 font-gaegu font-bold text-gray-600 hover:bg-gray-300"
              disabled
            >
              Donor Proof of Purchase: N/A
            </Button>
          )}
        </div>

        <div className="space-y-3 bg-[#F6F9FC] px-6 py-5">
          <EditableField
            value={formatISODate(claim?.dateDelivered ?? null)}
            editable={false}
            className="text-base"
          >
            Date Delivered (Confirmed by Donor):
          </EditableField>

          <EditableField
            className="text-base"
            value={formatISODate(claim?.dateReceived ?? null)}
            editable={false}
          >
            Date Received (Confirmed by Family):
          </EditableField>

          {deliveryProofUrl ? (
            <Button asChild className="h-11 w-full font-gaegu font-bold">
              <a
                href={deliveryProofUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Donor Delivery Confirmation
              </a>
            </Button>
          ) : (
            <Button
              className="h-11 w-full bg-gray-300 font-gaegu font-bold text-gray-600 hover:bg-gray-300"
              disabled
            >
              Donor Delivery Confirmation: N/A
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
