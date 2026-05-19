import type { GiftStatus } from "common";

export type CommittedGift = {
  id: string;
  title: string;
  productUrl: string;
  listedPrice: number;
  additionalInfo: string;
  status: GiftStatus;
  purchaseReceiptFileName: string | null;
  trackingNumber: string;
};

export type ChildStatus = "Warrior" | "Supersib";

export type CommittedChild = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  category: ChildStatus;
  gifts: Array<CommittedGift>;
};

export type GiftFormState = {
  ordered: boolean;
  delivered: boolean;
  receivedByFamily: boolean;
  receiptFileName: string | null;
  deliveryReceiptFileName: string | null;
  tracking: string;
  unclaimed: boolean;
  pendingUnclaim: boolean;
  changesSaved: boolean;
};
