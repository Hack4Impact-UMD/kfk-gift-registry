import { useState } from "react";
import type { Gift } from "@/mocks/mockFamily";
import { ConfirmGiftModal } from "./ConfirmGiftModal"
import { ThankYouNoteModal } from "./ThankYouNoteModal";
import { ExclamationCircleIcon } from "@/components/icons";

type Props = {
  gift: Gift;
  color: string;
};

export function GiftCard({ gift, color }: Props) {
  const formattedStatus =
    gift.status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl border p-4 mb-4 bg-card shadow-lg space-y-2">
        
        <p>
          <span className="font-semibold">Gift Name:</span>{" "}
          {gift.name}
        </p>

        <p>
          <span className="font-semibold">Price:</span>{" "}
          ${gift.price.toFixed(2)}
        </p>

        {gift.status === "delivered" && (
          <div className="grid grid-cols-2 gap-4 my-6 relative">

            <div
              onClick={() => setConfirmOpen(true)}
              className="cursor-pointer rounded-xl border-2 border-kfk-blue p-4 text-center shadow bg-card hover:bg-muted transition"
            >
              <p className="mb-3">
                Please confirm if you have received this gift!
              </p>

              <button className="bg-kfk-blue text-white px-4 py-2 rounded-md font-gaegu">
                Yes, I got the gift!
              </button>
            </div>

            <div
              onClick={() => setNoteOpen(true)}
              className="cursor-pointer rounded-xl border-2 border-kfk-blue p-4 text-center shadow bg-card hover:bg-muted transition"
            >
              <p className="mb-3">
                Send a thank you note to your donor
              </p>

              <button className="bg-kfk-blue text-white px-4 py-2 rounded-md font-gaegu">
                Write your note
              </button>
            </div>

          </div>
        )}

        <div className="w-full h-[2px] bg-ring shrink-0 rounded-full"></div>

        <p>
          <span className="font-semibold">Status:</span>{" "}
          {formattedStatus}
        </p>

        <p>
          <span className="font-semibold">Tracking Number:</span>{" "}
          {gift.trackingNumber ?? "N/A"}
        </p>

        <p>
          <span className="font-semibold">Date Delivered:</span>{" "}
          {gift.dateDelivered ?? "N/A"}
        </p>
      </div>

      {/* Modals */}

      <ConfirmGiftModal
        open={confirmOpen}
        onOpenChange={() => setConfirmOpen(false)}
      />

      <ThankYouNoteModal
        open={noteOpen}
        onOpenChange={() => setNoteOpen(false)}
      />
    </>
  );
}