import type { GiftStatus } from "common";

export type GiftClaimStatus = "unclaimed" | "claimed_kfk" | "claimed_donor";

export type PublishedGiftsTableRow = {
  id: string;
  giftName: string;
  giftStatus: GiftStatus;
  sponsorType: GiftClaimStatus;
  sponsorEmail?: string;
  childName?: string;
  parentName?: string;
  parentEmail?: string;
  dateOfFulfillment?: string;
  productUrl?: string;
};
