import { useState } from "react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { EditableField } from "@/components/review/EditableField";
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
  const progressBorderColor =
    status === "RECEIVED" ? "border-kfk-green" : "border-kfk-yellow";

  return (
    <div className="mt-5 mb-3 w-full font-bold font-gaegu">
      <div className="relative h-8 flex items-center w-full">
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
              <div key={i} className="flex-1 flex justify-center">
                <div
                  className={[
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm",
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

      <div className="flex w-full mt-1">
        {GIFT_STEPS.map((label) => (
          <div key={label} className="flex-1 text-center text-xs">
            {label}
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
  const [isEditing, setIsEditing] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);

  const [editedGift, setEditedGift] = useState<Partial<Gift>>({});

  const [localFields, setLocalFields] = useState({
    donorName: donorName ?? "",
    donorEmail: donorEmail ?? "",
    trackingId: trackingId ?? "",
    dateOrdered: dateOrdered ?? "",
    dateDelivered: dateDelivered ?? "",
    dateReceived: dateReceived ?? "",
  });

  const getValue = <K extends keyof Gift>(key: K) =>
    (key in editedGift ? editedGift[key] : gift[key]) as Gift[K];

  const handleChange = (key: keyof Gift, value: any) => {
    setEditedGift((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocalChange = (key: keyof typeof localFields, value: string) => {
    setLocalFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(gift.id, {
        ...editedGift,
      });
    }

    console.log("Local fields (not persisted yet):", localFields);

    setEditedGift({});
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedGift({});
    setLocalFields({
      donorName: donorName ?? "",
      donorEmail: donorEmail ?? "",
      trackingId: trackingId ?? "",
      dateOrdered: dateOrdered ?? "",
      dateDelivered: dateDelivered ?? "",
      dateReceived: dateReceived ?? "",
    });
    setIsEditing(false);
  };

  const hasProof = !!proofOfPurchaseUrl;

  const displayLocal = (val?: string) =>
    isEditing ? val ?? "" : val?.trim() ? val : "N/A";

  return (
    <div className="px-6 py-5 space-y-4 text-sm">
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden w-full">
        <div className="bg-[#EEF4FA] px-5 py-4 flex justify-between items-start">
          <div className="space-y-1">
            <EditableField
              value={getValue("title") ?? ""}
              editable={isEditing}
              onChange={(e) => handleChange("title", e.target.value)}
              className="text-lg font-medium"
            >
              Gift Name:
            </EditableField>

            <EditableField
              value={
                isEditing
                  ? getValue("listedPrice") ?? ""
                  : gift.listedPrice != null
                  ? `$${gift.listedPrice.toFixed(2)}`
                  : "N/A"
              }
              editable={isEditing}
              onChange={(e) =>
                handleChange("listedPrice", parseFloat(e.target.value))
              }
            >
              Price:
            </EditableField>

            {isEditing && (
              <EditableField
                value={getValue("status")}
                editable
                fieldType="select"
                selectOptions={[
                  "AVAILABLE",
                  "CLAIMED",
                  "PURCHASED",
                  "DELIVERED",
                  "RECEIVED",
                ]}
                onChange={(val) => handleChange("status", val)}
              >
                Status:
              </EditableField>
            )}
          </div>

          {!isEditing ? (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-kfk-blue text-white"
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white px-6 py-6">
          {!isEditing && <GiftProgressBar status={gift.status} />}
        </div>

        <div className="px-6 py-5 space-y-4 bg-[#F6F9FC]">
          <div className="flex justify-between gap-6">
            <EditableField
              className="max-w-[45%]"
              value={displayLocal(localFields.donorName)}
              editable={isEditing}
              onChange={(e) => handleLocalChange("donorName", e.target.value)}
            >
              Donor:
            </EditableField>

            <EditableField
              className="max-w-[45%]"
              value={displayLocal(localFields.donorEmail)}
              editable={isEditing}
              onChange={(e) => handleLocalChange("donorEmail", e.target.value)}
            >
              Donor Email:
            </EditableField>
          </div>

          <EditableField
            value={displayLocal(localFields.trackingId)}
            editable={isEditing}
            onChange={(e) => handleLocalChange("trackingId", e.target.value)}
          >
            Tracking ID:
          </EditableField>
        </div>

        <div className="bg-white px-6 py-5 space-y-3">
          <EditableField
            value={displayLocal(localFields.dateOrdered)}
            editable={isEditing}
            onChange={(e) => handleLocalChange("dateOrdered", e.target.value)}
          >
            Date Ordered (Confirmed by Donor):
          </EditableField>

          <Button
            className={`w-full h-11 font-gaegu font-bold ${
              hasProof
                ? "bg-kfk-blue text-white hover:bg-kfk-blue/80"
                : "bg-gray-300 text-gray-500 cursor-default"
            }`}
            disabled={!hasProof}
            onClick={() => hasProof && setProofOpen(true)}
          >
            Donor Proof of Purchase
          </Button>
        </div>

        <div className="px-6 py-5 space-y-3 bg-[#F6F9FC]">
          <EditableField
            value={displayLocal(localFields.dateDelivered)}
            editable={isEditing}
            onChange={(e) => handleLocalChange("dateDelivered", e.target.value)}
          >
            Date Delivered (Confirmed by Donor):
          </EditableField>

          <EditableField
            value={displayLocal(localFields.dateReceived)}
            editable={isEditing}
            onChange={(e) => handleLocalChange("dateReceived", e.target.value)}
          >
            Date Received (Confirmed by Family):
          </EditableField>
        </div>
      </div>

      <Dialog open={proofOpen} onOpenChange={setProofOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proof of Purchase</DialogTitle>
          </DialogHeader>

          {hasProof ? (
            <img src={proofOfPurchaseUrl} className="w-full" />
          ) : (
            <div className="h-40 bg-gray-200 flex items-center justify-center">
              No image
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}