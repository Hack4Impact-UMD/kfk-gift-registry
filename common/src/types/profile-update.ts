import type { Child } from "./child";
import type { Gift } from "./gift";

export type ProfileUpdateGift = Pick<
  Gift,
  "id" | "title" | "productUrl" | "backup" | "active" | "privateNotes"
>;

export type ChildProfileUpdateData = Partial<Omit<Child, "id">>;

export type ProfileUpdateStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ChildProfileUpdate {
  id: string;
  childId: string;
  requestedBy: string;
  changes: ChildProfileUpdateData;
  status: ProfileUpdateStatus;
  requestedAt: string;
  reviewedAt?: string;
  appliedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}
