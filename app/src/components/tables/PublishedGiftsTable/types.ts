import type { GiftStatus } from "common";

export type GiftClaimStatus =
  | "unclaimed"
  | "claimed"
  | "claimed_kfk"
  | "claimed_donor";

export type PublishedGiftsTableRow = {
  id: string;
  giftName: string;
  giftStatus: GiftStatus;
  sponsorType: GiftClaimStatus;
  sponsorName?: string;
  sponsorEmail?: string;
  dateOfFulfillment?: string;
  productUrl?: string;
};

/** Handlers passed to the table via `table.options.meta` for the action column. */
export type PublishedGiftsTableMeta = {
  onClaimGift: (giftId: string) => void;
  onOpenClaimDetails: (row: PublishedGiftsTableRow) => void;
  /** giftId currently being claimed (for per-row pending state), else null. */
  claimingGiftId: string | null;
};
