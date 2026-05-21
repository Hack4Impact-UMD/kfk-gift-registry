import type { GiftStatus } from "common";

export type CommittedGift = {
  id: string;
  title: string;
  productUrl: string;
  listedPrice: number;
  additionalInfo: string;
  status: GiftStatus;
  purchaseReceiptFileName: string | null;
  purchaseReceiptUrl: string | null;
  deliveryReceiptFileName: string | null;
  deliveryReceiptUrl: string | null;
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
  receiptUrl: string | null;
  deliveryReceiptFileName: string | null;
  deliveryReceiptUrl: string | null;
  savedTracking: string;
  tracking: string;
  unclaimed: boolean;
  pendingUnclaim: boolean;
  changesSaved: boolean;
};
