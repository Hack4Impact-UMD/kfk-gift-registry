import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { ConfirmGiftModal } from "./ConfirmGiftModal";
import { ThankYouNoteModal } from "./ThankYouNoteModal";
import type { Claim, Gift } from "common";
import { ExclamationCircleIcon } from "@/components/icons";
import { confirmGiftReceivedWithToken } from "@/server/functions/child";

const GIFT_STEPS = [
  "Available",
  "Claimed",
  "Purchased",
  "Delivered",
  "Received",
];
const GIFT_STATUS_ORDER = [
  "AVAILABLE",
  "CLAIMED",
  "PURCHASED",
  "DELIVERED",
  "RECEIVED",
];

type GiftCardProps = {
  gift: Gift;
  claim?: Claim;
  token: string;
  childId: string;
};

const TRACK_START = 10;
const TRACK_WIDTH = 80;

function formatDate(value?: string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GiftCard({ gift, claim, token, childId }: GiftCardProps) {
  const formattedStatus = gift.status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const router = useRouter();

  const confirmGiftMutation = useMutation({
    mutationFn: () =>
      confirmGiftReceivedWithToken({
        data: {
          token,
          childId,
          giftId: gift.id,
        },
      }),
    onSuccess: async () => {
      setConfirmOpen(false);
      await router.invalidate();
    },
  });

  const currentStep = GIFT_STATUS_ORDER.indexOf(
    gift.status as (typeof GIFT_STATUS_ORDER)[number],
  );
  const filledTo = currentStep >= 0 ? currentStep + 1 : 0;
  const fillWidthPercent =
    filledTo > 0 ? TRACK_WIDTH * ((filledTo - 1) / (GIFT_STEPS.length - 1)) : 0;
  const progressColor =
    gift.status === "RECEIVED" ? "bg-kfk-green" : "bg-kfk-yellow";
  const progressBorderColor =
    gift.status === "RECEIVED" ? "border-kfk-green" : "border-kfk-yellow";

  return (
    <>
      <div
        className="rounded-xl border p-4 mb-4 bg-card space-y-2"
        style={{ boxShadow: "0 0 8px rgba(0,0,0,0.35)" }}
      >
        {gift.status === "RECEIVED" && (
          <div className="-mx-4 mb-4 bg-kfk-green text-white text-center shrink-0">
            <p className="p-2 font-bold">Yay! You received this gift!</p>
          </div>
        )}

        <p>
          <span className="font-bold">Gift Name:</span> {gift.title}
        </p>

        <p>
          <span className="font-bold">Price:</span> $
          {(gift.listedPrice ?? 0).toFixed(2)}
        </p>

        {gift.status === "DELIVERED" && (
          <div className="grid grid-cols-2 gap-4 my-6 relative">
            <div className="relative cursor-pointer rounded-xl border-2 border-kfk-blue p-4 text-center shadow bg-card hover:bg-muted transition">
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-kfk-red/50 blur-sm animate-ping"></span>
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-kfk-red flex items-center justify-center text-white">
                <ExclamationCircleIcon className="size-5" />
              </div>
              <p className="mb-3">
                Please confirm if you have received this gift!
              </p>

              <Button
                onClick={() => {
                  confirmGiftMutation.reset();
                  setConfirmOpen(true);
                }}
                className="bg-kfk-blue text-white px-2 py-2 rounded-md font-gaegu"
                disabled={confirmGiftMutation.isPending}
              >
                Yes, I got the gift!
              </Button>
            </div>

            <div className="cursor-pointer rounded-xl border-2 border-kfk-blue p-4 text-center shadow bg-card hover:bg-muted transition">
              <p className="mb-3">Send a thank you note to your donor</p>

              <Button
                onClick={() => setNoteOpen(true)}
                className="bg-kfk-blue text-white px-2 py-2 rounded-md font-gaegu"
              >
                Write your note
              </Button>
            </div>
          </div>
        )}

        <div className="w-full h-[2px] bg-ring shrink-0 rounded-full"></div>

        <div className="mt-5 mb-3 w-full">
          <div className="relative h-8 flex items-center w-full">
            <div
              className={`absolute h-[14px] rounded-full border-2 ${progressBorderColor}`}
              style={{ left: `${TRACK_START}%`, width: `${TRACK_WIDTH}%` }}
            />
            <div
              className={`absolute h-[14px] rounded-full transition-[width] ${progressColor}`}
              style={{ left: `${TRACK_START}%`, width: `${fillWidthPercent}%` }}
            />
            <div className="relative z-10 flex w-full">
              {GIFT_STEPS.map((label, i) => {
                const isComplete = i <= currentStep;
                return (
                  <div key={label} className="flex-1 flex justify-center">
                    <div
                      className={[
                        "w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-medium relative z-10",
                        isComplete
                          ? `text-white ${progressColor}`
                          : `border-2 ${progressBorderColor} bg-card text-foreground`,
                      ].join(" ")}
                    >
                      {i + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex w-full mt-1">
            {GIFT_STEPS.map((label) => (
              <div key={label} className="flex-1 min-w-0 flex justify-center">
                <span className="text-md font-gaegu font-semibold text-center block">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p>
          <span className="font-bold">Status:</span> {formattedStatus}
        </p>

        <p>
          <span className="font-bold">Tracking Number:</span>{" "}
          {claim?.purchaseConfirmation?.trackingNumber ?? "N/A"}
        </p>

        <p>
          <span className="font-bold">Claimed On:</span>{" "}
          {formatDate(claim?.claimedAt)}
        </p>

        <p>
          <span className="font-bold">Purchase Confirmed:</span>{" "}
          {formatDate(claim?.purchaseConfirmation?.date)}
        </p>

        <p>
          <span className="font-bold">Expected Delivery:</span>{" "}
          {formatDate(claim?.expectedDeliveryDate)}
        </p>

        <p>
          <span className="font-bold">Date Delivered:</span>{" "}
          {formatDate(claim?.deliveryConfirmed?.date)}
        </p>

        {gift.status === "RECEIVED" && (
          <p>
            <span className="font-bold">Date Received:</span>{" "}
            {formatDate(claim?.receivedAt)}
          </p>
        )}
      </div>

      <ConfirmGiftModal
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            confirmGiftMutation.reset();
          }
          setConfirmOpen(open);
        }}
        onConfirm={() => confirmGiftMutation.mutate()}
        isPending={confirmGiftMutation.isPending}
        errorMessage={
          confirmGiftMutation.error instanceof Error
            ? confirmGiftMutation.error.message
            : undefined
        }
      />

      <ThankYouNoteModal
        open={noteOpen}
        onOpenChange={() => setNoteOpen(false)}
      />
    </>
  );
}
