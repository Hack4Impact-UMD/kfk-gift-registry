export type GiftStatus =
  | "AVAILABLE"
  | "CLAIMED"
  | "PURCHASED"
  | "DELIVERED"
  | "RECEIVED";

export interface Gift {
  id: string;
  childId: string;
  familyId: string;
  giftDrive: string;
  title: string;
  productUrl: string;
  listedPrice?: number;
  status: GiftStatus;
  claimedByDonorId?: string;
  createdAt: string;
  privateNotes?: string;
  backup: boolean;
  active: boolean;
}
