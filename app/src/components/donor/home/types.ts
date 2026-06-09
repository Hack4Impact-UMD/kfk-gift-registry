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
  thankYouNote: string | null;
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
  savedDelivered: boolean;
  receivedByFamily: boolean;
  receiptFileName: string | null;
  receiptUrl: string | null;
  savedReceiptFileName: string | null;
  savedReceiptUrl: string | null;
  deliveryReceiptFileName: string | null;
  deliveryReceiptUrl: string | null;
  savedDeliveryReceiptFileName: string | null;
  savedDeliveryReceiptUrl: string | null;
  savedTracking: string;
  tracking: string;
  unclaimed: boolean;
  changesSaved: boolean;
};
