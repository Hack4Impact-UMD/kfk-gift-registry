import type { CSSProperties } from "react";
import type { CommittedGift, GiftFormState } from "./types";

export function createInitialGiftStates(
  gifts: Array<CommittedGift>,
): Record<string, GiftFormState> {
  return Object.fromEntries(
    gifts.map((g) => [
      g.id,
      {
        ordered: ["PURCHASED", "DELIVERED", "RECEIVED"].includes(g.status),
        delivered: ["DELIVERED", "RECEIVED"].includes(g.status),
        receivedByFamily: g.status === "RECEIVED",
        receiptFileName: g.purchaseReceiptFileName,
        deliveryReceiptFileName: null,
        tracking: g.trackingNumber,
        unclaimed: false,
        changesSaved: true,
        pendingUnclaim: false,
      },
    ]),
  );
}

export function formatUsd(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function getBlueBackground(): CSSProperties {
  return {
    backgroundColor: "#0839b1",
    backgroundImage: `
      radial-gradient(circle at 20% 20%, #1a3fbf 25px, transparent 25px),
      radial-gradient(circle at 70% 10%, #1a3fbf 15px, transparent 15px),
      radial-gradient(circle at 50% 40%, #1a3fbf 35px, transparent 35px),
      radial-gradient(circle at 90% 35%, #1a3fbf 28px, transparent 28px),
      radial-gradient(circle at 10% 60%, #1a3fbf 30px, transparent 30px),
      radial-gradient(circle at 75% 65%, #1a3fbf 38px, transparent 38px),
      radial-gradient(circle at 35% 80%, #1a3fbf 32px, transparent 32px),
      radial-gradient(circle at 85% 85%, #1a3fbf 20px, transparent 20px),
      radial-gradient(circle at 55% 90%, #1a3fbf 25px, transparent 25px)
    `,
  };
}
