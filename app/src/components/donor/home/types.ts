import type { Address, GiftStatus } from "common";

export type CommittedGift = {
  id: string;
  familyId: string;
  familyAddress: Address | null;
  title: string;
  productUrl: string;
  listedPrice: number;
  additionalInfo: string;
  status: GiftStatus;
  purchaseReceiptFileName: string | null;
  purchaseReceiptPath: string | null;
  deliveryReceiptFileName: string | null;
  deliveryReceiptPath: string | null;
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
  receiptPath: string | null;
  savedReceiptFileName: string | null;
  savedReceiptPath: string | null;
  deliveryReceiptFileName: string | null;
  deliveryReceiptPath: string | null;
  savedDeliveryReceiptFileName: string | null;
  savedDeliveryReceiptPath: string | null;
  savedTracking: string;
  tracking: string;
  unclaimed: boolean;
  changesSaved: boolean;
};
