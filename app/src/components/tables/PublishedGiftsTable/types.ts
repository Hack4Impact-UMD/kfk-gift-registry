export type GiftPurchaseStatus =
  | "unpurchased"
  | "purchased"
  | "purchased_kfk"
  | "purchased_donor";

export type PublishedGiftsTableRow = {
  id: string;
  giftName: string;
  giftStatus: string;
  sponsorType: GiftPurchaseStatus;
  sponsorName?: string;
  sponsorEmail?: string;
  dateOfFulfillment?: string;
  productUrl?: string;
};
