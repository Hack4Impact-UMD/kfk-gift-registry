import { useRef, useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/review/EditableField";
import { createTransaction } from "@tanstack/react-db";
import type { Transaction } from "@tanstack/react-db";
import { useCollections } from "@/collections/context";
import type { Gift, GiftStatus } from "common";
import { toast } from "@/lib/toast";
import {
  GIFT_TITLE_TOO_LONG_MESSAGE,
  MAX_GIFT_TITLE_LENGTH,
  isGiftTitleTooLong,
} from "common";

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
}

export function GiftInfoCard({ gift }: GiftInfoCardProps) {
  const collections = useCollections();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const txRef = useRef<Transaction | null>(null);

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

  const handleSave = () => {
    if (isGiftTitleTooLong(gift.title)) {
      toast.error(GIFT_TITLE_TOO_LONG_MESSAGE);
      return;
    }

    const tx = txRef.current;
    if (!tx || tx.mutations.length === 0) {
      txRef.current = null;
      setIsEditing(false);
      return;
    }

    startSaveTransition(async () => {
      try {
        await tx.commit();
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
    setIsEditing(false);
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
                onClick={() => setIsEditing(true)}
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
      </div>
    </div>
  );
}
