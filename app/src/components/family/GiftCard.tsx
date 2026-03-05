import type { Gift } from "@/mocks/mockFamily";

type Props = {
  gift: Gift;
  color: string;
};

export function GiftCard({ gift, color}: Props) {
  const formattedStatus =
    gift.status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="rounded-xl border p-4 mb-4 bg-card shadow-lg space-y-2">
      
      <p>
        <span className="font-semibold">Gift Name:</span>{" "}
        {gift.name}
      </p>

      <p>
        <span className="font-semibold">Price:</span>{" "}
        ${gift.price.toFixed(2)}
      </p>

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
  );
}