import type { Child } from "./child";
import type { Gift } from "./gift";

export type ProfileUpdateGift = Pick<
  Gift,
  "id" | "title" | "productUrl" | "backup" | "active" | "privateNotes"
>;

export type ChildProfileUpdate = Partial<Omit<Child, "id">> & {
  diagnosisLength?: string;
  bereaved?: boolean;
  livesAtHome?: boolean;
  gifts?: Array<ProfileUpdateGift>;
};

export type ProfileUpdateStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProfileUpdate {
  id: string;
  childId: string;
  requestedBy: string;
  changes: ChildProfileUpdate;
  status: ProfileUpdateStatus;
  requestedAt: string;
  reviewedAt?: string;
  appliedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}
