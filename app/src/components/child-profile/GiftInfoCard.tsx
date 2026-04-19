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

/* ─── Progress Bar ───────────────────────────────────────────── */

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
    <div className="mt-5 mb-3 w-full">
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

/* ─── Main Component ─────────────────────────────────────────── */

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

  return (
    <>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <div>
              <span className="font-bold">Gift Name: </span>
              {isEditing ? (
                <Input
                  value={(getValue("title") as string) ?? ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="inline-block w-64 ml-1"
                />
              ) : (
                gift.title
              )}
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>

          <p>
            <span className="font-bold">Price: </span>
            {isEditing ? (
              <Input
                type="number"
                value={(getValue("listedPrice") as number) ?? ""}
                onChange={(e) =>
                  handleChange("listedPrice", parseFloat(e.target.value))
                }
                className="inline-block w-28 ml-1"
              />
            ) : gift.listedPrice != null ? (
              `$${gift.listedPrice.toFixed(2)}`
            ) : (
              "N/A"
            )}
          </p>

          {isEditing && (
            <select
              value={getValue("status") as string}
              onChange={(e) => handleChange("status", e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="AVAILABLE">Unordered</option>
              <option value="CLAIMED">Claimed</option>
              <option value="PURCHASED">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="RECEIVED">Received</option>
            </select>
          )}

          <GiftProgressBar status={gift.status} />

          <div className="flex justify-between">
            <p>
              <span className="font-bold">Donor: </span>
              {isEditing ? (
                <Input
                  value={localFields.donorName}
                  onChange={(e) =>
                    handleLocalChange("donorName", e.target.value)
                  }
                  className="inline-block w-40 ml-1"
                />
              ) : (
                donorName ?? "N/A"
              )}
            </p>

            <p>
              <span className="font-bold">Donor Email: </span>
              {isEditing ? (
                <Input
                  value={localFields.donorEmail}
                  onChange={(e) =>
                    handleLocalChange("donorEmail", e.target.value)
                  }
                  className="inline-block w-48 ml-1"
                />
              ) : (
                donorEmail ?? "N/A"
              )}
            </p>
          </div>

          <p>
            <span className="font-bold">Tracking ID: </span>
            {isEditing ? (
              <Input
                value={localFields.trackingId}
                onChange={(e) =>
                  handleLocalChange("trackingId", e.target.value)
                }
                className="inline-block w-48 ml-1"
              />
            ) : (
              trackingId ?? "N/A"
            )}
          </p>
          <p>
            <span className="font-bold">Date Ordered: </span>
            {isEditing ? (
              <Input
                type="date"
                value={localFields.dateOrdered}
                onChange={(e) =>
                  handleLocalChange("dateOrdered", e.target.value)
                }
                className="inline-block ml-1"
              />
            ) : (
              localFields.dateOrdered || "N/A"
            )}
          </p>

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

          <p>
            <span className="font-bold">Date Delivered: </span>
            {isEditing ? (
              <Input
                type="date"
                value={localFields.dateDelivered}
                onChange={(e) =>
                  handleLocalChange("dateDelivered", e.target.value)
                }
                className="inline-block ml-1"
              />
            ) : (
              localFields.dateDelivered || "N/A"
            )}
          </p>

          <p>
            <span className="font-bold">Date Received: </span>
            {isEditing ? (
              <Input
                type="date"
                value={localFields.dateReceived}
                onChange={(e) =>
                  handleLocalChange("dateReceived", e.target.value)
                }
                className="inline-block ml-1"
              />
            ) : (
              localFields.dateReceived || "N/A"
            )}
          </p>
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
    </>
  );
}