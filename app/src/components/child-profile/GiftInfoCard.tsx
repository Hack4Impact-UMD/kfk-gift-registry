import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Gift, GiftStatus } from "common";

const GIFT_STEPS = ["Unordered", "Claimed", "In Transit", "Delivered", "Received"];
const GIFT_STATUS_ORDER: GiftStatus[] = [
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
  const unfillColor =
    status === "RECEIVED" ? "bg-kfk-green/30" : "bg-kfk-yellow/30";
  const progressBorderColor =
    status === "RECEIVED" ? "border-kfk-green" : "border-kfk-yellow";

  return (
    <div className="mt-5 mb-3 w-full">
      <div className="relative h-8 flex items-center w-full">
        {/* unfilled track */}
        <div
          className={`absolute h-[10px] rounded-full border-2 ${progressBorderColor}`}
          style={{ left: `${TRACK_START}%`, width: `${TRACK_WIDTH}%` }}
        />
        {/* filled track */}
        <div
          className={`absolute h-[10px] rounded-full transition-[width] ${progressColor}`}
          style={{ left: `${TRACK_START}%`, width: `${fillWidthPercent}%` }}
        />
        {/* nodes */}
        <div className="relative z-10 flex w-full">
          {GIFT_STEPS.map((label, i) => {
            const isComplete = i < filledTo;
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
      {/* labels */}
      <div className="flex w-full mt-1">
        {GIFT_STEPS.map((label) => (
          <div key={label} className="flex-1 min-w-0 flex justify-center">
            <span className="text-xs font-gaegu text-center block">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GiftInfoCardProps {
  gift: Gift;
  donorName?: string;
  donorEmail?: string;
  trackingId?: string;
  dateOrdered?: string;
  dateDelivered?: string;
  dateReceived?: string;
  proofOfPurchaseUrl?: string;
  onUpdate?: (giftId: string, updates: Partial<Gift>) => void;
}

export function GiftInfoCard({
  gift,
  donorName,
  donorEmail,
  trackingId,
  dateOrdered,
  dateDelivered,
  dateReceived,
  proofOfPurchaseUrl,
  onUpdate,
}: GiftInfoCardProps) {
  const [localFields, setLocalFields] = useState({
    donorName: donorName ?? "",
    donorEmail: donorEmail ?? "",
    trackingId: trackingId ?? "",
    dateOrdered: dateOrdered ?? "",
    dateDelivered: dateDelivered ?? "",
    dateReceived: dateReceived ?? "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);
  const [editedGift, setEditedGift] = useState<Partial<Gift>>({});

  const getValue = <K extends keyof Gift>(key: K) =>
    (key in editedGift ? editedGift[key] : gift[key]) as Gift[K];

  const handleChange = (key: keyof Gift, value: string | number) =>
    setEditedGift((prev) => ({ ...prev, [key]: value }));

  const handleLocalChange = (key: keyof typeof localFields, value: string) => {
    setLocalFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onUpdate && Object.keys(editedGift).length > 0) {
      onUpdate(gift.id, editedGift);
    }
    setEditedGift({});
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedGift({});
    setIsEditing(false);
  };

  const hasProof = !!proofOfPurchaseUrl;

  return (
    <div className="p-4 space-y-3 text-sm">
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="font-bold">Gift Name: </span>
            {isEditing ? (
              <Input
                value={(getValue("title") as string) ?? ""}
                onChange={(e) => handleChange("title", e.target.value)}
                className="h-7 text-sm inline-block w-64 ml-1"
              />
            ) : (
              <span>{gift.title}</span>
            )}
          </div>
          {isEditing ? (
            <div className="flex gap-1 shrink-0">
              <Button size="sm" onClick={handleSave} className="h-7 bg-kfk-blue text-white hover:bg-kfk-blue/80">
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-7">
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 bg-kfk-blue text-white hover:bg-kfk-blue/80 shrink-0"
            >
              Edit
            </Button>
          )}
        </div>

        {/* Price */}
        <p>
          <span className="font-bold">Price: </span>
          {isEditing ? (
            <Input
              type="number"
              value={(getValue("listedPrice") as number) ?? ""}
              onChange={(e) => handleChange("listedPrice", parseFloat(e.target.value))}
              className="h-7 text-sm inline-block w-28 ml-1"
            />
          ) : (
            <span>
              {gift.listedPrice != null ? `$${gift.listedPrice.toFixed(2)}` : "N/A"}
            </span>
          )}
        </p>

        {/* Progress bar */}
        <div className="w-full h-[1px] bg-ring shrink-0 rounded-full my-2" />
        <GiftProgressBar status={gift.status} />
        <div className="w-full h-[1px] bg-ring shrink-0 rounded-full mt-2" />

        {/* Donor row */}
        <div className="flex items-center justify-between pt-1">
          <p>
            <span className="font-bold">Donor: </span>
            {donorName ?? "N/A"}
          </p>
          <p>
            <span className="font-bold">Donor Email: </span>
            {donorEmail ?? "N/A"}
          </p>
        </div>

        {/* Tracking ID */}
        <p>
          <span className="font-bold">Tracking ID: </span>
          {trackingId ? (
            <a href="#" className="text-blue-600 hover:underline">
              {trackingId}
            </a>
          ) : (
            "N/A"
          )}
        </p>

        {/* Date Ordered */}
        <p>
          <span className="font-bold">Date Ordered (Confirmed by Donor): </span>
          {dateOrdered ?? "N/A"}
        </p>

        {/* Proof of Purchase button */}
        <Button
          className={`w-full font-gaegu font-bold ${
            hasProof
              ? "bg-kfk-blue text-white hover:bg-kfk-blue/80"
              : "bg-gray-300 text-gray-500 cursor-default"
          }`}
          disabled={!hasProof}
          onClick={() => hasProof && setProofOpen(true)}
        >
          Donor Proof of Purchase
        </Button>

        {/* Date Delivered */}
        <p>
          <span className="font-bold">Date Delivered (Confirmed by Donor): </span>
          {dateDelivered ?? "N/A"}
        </p>

        {/* Date Received */}
        <p>
          <span className="font-bold">Date Received (Confirmed by Family): </span>
          {dateReceived ?? "N/A"}
        </p>
      </div>

      {/* Proof dialog */}
      <Dialog open={proofOpen} onOpenChange={setProofOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Donor Proof of Purchase</DialogTitle>
          </DialogHeader>
          {hasProof ? (
            <img
              src={proofOfPurchaseUrl}
              alt="Proof of purchase"
              className="w-full rounded-md object-contain max-h-[60vh]"
            />
          ) : (
            <div className="h-48 rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
              No screenshot uploaded
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}