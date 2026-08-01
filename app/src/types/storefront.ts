import type { Child, Gift } from "common";

export type StorefrontChild = Omit<
  Child,
  | "staffPrivateNotes"
  | "childSocialWorker"
  | "giftDrive"
  | "createdAt"
  | "livesAtHome"
  | "treatmentLevel"
  | "diagnosisLengthYears"
  | "offTreatmentDurationYears"
  | "hospital"
  | "public"
> & {
  gifts: Array<StorefrontGift>;
};

export type StorefrontGift = Pick<
  Gift,
  | "id"
  | "title"
  | "productUrl"
  | "listedPrice"
  | "status"
  | "familyPublicNotes"
  | "familyId"
  | "childId"
> & {
  childName: string;
};
