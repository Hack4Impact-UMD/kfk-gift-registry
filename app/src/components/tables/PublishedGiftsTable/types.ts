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
