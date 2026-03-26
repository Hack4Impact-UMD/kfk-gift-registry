import type { Child, Gift } from "common";

export type StorefrontChild = Omit<
  Child,
  | "staffPrivateNotes"
  | "childSocialWorker"
  | "familyId"
  | "giftDrive"
  | "createdAt"
  | "livesAtHome"
  | "treatmentLevel"
  | "diagnosisLengthYears"
  | "offTreatmentDurationYears"
  | "hospital"
  | "public"
>;

export type StorefrontGift = Pick<
  Gift,
  "id" | "title" | "productUrl" | "listedPrice" | "status"
>;
