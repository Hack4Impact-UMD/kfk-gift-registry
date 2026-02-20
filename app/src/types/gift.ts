export type GiftStatus =
  | "AVAILABLE"
  | "CLAIMED"
  | "PURCHASED"
  | "SHIPPED"
  | "RECEIVED";

export interface Gift {
  id: string;
  childId: string;
  title: string;
  productUrl: string;
  listedPrice: number;
  status: GiftStatus;
  claimedByDonorId?: string;
  createdAt: string;
  privateNotes?: string;
}
