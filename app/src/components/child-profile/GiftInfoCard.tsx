import { useRef, useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/review/EditableField";
import { createTransaction } from "@tanstack/react-db";
import type { Transaction } from "@tanstack/react-db";
import { useCollections } from "@/collections/context";
import { useQueryClient } from "@tanstack/react-query";
import { queries } from "@/queries";
import type { Gift, GiftStatus } from "common";
import { toast } from "@/lib/toast";
import {
  GIFT_TITLE_TOO_LONG_MESSAGE,
  MAX_GIFT_TITLE_LENGTH,
  isGiftTitleTooLong,
} from "common";
import type { GiftClaimDetails } from "@/server/functions/child";
import { updateClaimTrackingNumber } from "@/server/functions/child";

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
        <div className="relative flex h-8 items-center w-full">
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
  const txRef = useRef<Transaction | null>(null);
  const [trackingId, setTrackingId] = useState(claim?.trackingNumber ?? "");
  const trackingIdBeforeEdit = useRef(claim?.trackingNumber ?? "");

  const editField = <K extends keyof Gift>(key: K, value: Gift[K]) => {
    if (!txRef.current) {
      txRef.current = createTransaction({
        autoCommit: false,
        mutationFn: async ({ transaction }) => {
          await collections.persistBatchMutation(transaction);
        },
      });
    }
    txRef.current.mutate(() => {
      collections.gifts.update(gift.id, (draft) => {
        (draft as Gift)[key] = value;
      });
    });
  };

  const handleEditStart = () => {
    trackingIdBeforeEdit.current = trackingId;
    setIsEditing(true);
  };

  const handleSave = () => {
    if (isGiftTitleTooLong(gift.title)) {
      toast.error(GIFT_TITLE_TOO_LONG_MESSAGE);
      return;
    }

    const tx = txRef.current;
    const trackingChanged = trackingId !== trackingIdBeforeEdit.current;
    const hasGiftMutations = tx && tx.mutations.length > 0;

    if (!hasGiftMutations && !trackingChanged) {
      txRef.current = null;
      setIsEditing(false);
      return;
    }

    startSaveTransition(async () => {
      try {
        const saves: Array<Promise<unknown>> = [];
        if (hasGiftMutations) saves.push(tx.commit());
        if (trackingChanged && claim?.claimId) {
          saves.push(
            updateClaimTrackingNumber({
              data: { claimId: claim.claimId, trackingNumber: trackingId },
            }).then(() => {
              void queryClient.invalidateQueries(
                queries.claims.byChildId(gift.childId),
              );
            }),
          );
        }
        await Promise.all(saves);
        txRef.current = null;
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
    setTrackingId(trackingIdBeforeEdit.current);
    setIsEditing(false);
  };

  const trackingEditable = isEditing && !!claim?.claimId;

  const formatDate = (iso: string | null): string => {
    if (!iso) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="px-6 py-5 space-y-4 text-sm">
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden w-full">
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

        <div className="px-6 py-5 space-y-4 bg-[#F6F9FC]">
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
          </div>

          <EditableField
            value={trackingEditable ? trackingId : trackingId.trim() || "N/A"}
            editable={trackingEditable}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setTrackingId(event.target.value)
            }
          >
            Tracking ID:
          </EditableField>
        </div>

        <div className="bg-white px-6 py-5 space-y-3">
          <EditableField
            value={formatDate(claim?.dateOrdered ?? null)}
            editable={false}
          >
            Date Ordered (Confirmed by Donor):
          </EditableField>
        </div>

        <div className="px-6 py-5 space-y-3 bg-[#F6F9FC]">
          <EditableField
            value={formatDate(claim?.dateDelivered ?? null)}
            editable={false}
          >
            Date Delivered (Confirmed by Donor):
          </EditableField>

          <EditableField
            value={formatDate(claim?.dateReceived ?? null)}
            editable={false}
          >
            Date Received (Confirmed by Family):
          </EditableField>
        </div>
      </div>
    </div>
  );
}
