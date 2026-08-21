import type { TreatmentLevel } from "common";

export type ChildProfileVisibility = "published" | "unpublished";

export type ApprovedProfileTableRow = {
  id: string;
  childName: string;
  profilePictureUrl?: string;
  parentGuardian: string;
  email: string;
  age: number;
  treatmentLevel?: TreatmentLevel;
  type: "warrior" | "supersib";
  published: boolean;
  giftsFulfilled: number;
  giftsTotal: number;
};
