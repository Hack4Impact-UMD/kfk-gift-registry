import { z } from "zod";

export const EmailJobStatusSchema = z.enum([
  "pending",
  "scheduled",
  "sent",
  "failed",
  "cancelled",
]);

export type EmailJobStatus = z.infer<typeof EmailJobStatusSchema>;

/* implementation will utilize either resend or our own cloud func */
export const EmailJobTypeSchema = z.enum([
  "DONOR_POST_CLAIM_CONFIRMATION",
  "DONOR_PURCHASE_REMINDER",
]);

export type EmailJobType = z.infer<typeof EmailJobTypeSchema>;

export const DonorClaimGiftSummarySchema = z.object({
  giftId: z.string(),
  childId: z.string(),
  childName: z.string(),
  familyId: z.string(),
  familyName: z.string(),
  giftTitle: z.string(),
  productUrl: z.string().optional(),
  listedPrice: z.number().optional(),
  familyPublicNotes: z.string().optional(),
});

export type DonorClaimGiftSummary = z.infer<typeof DonorClaimGiftSummarySchema>;

export const DonorClaimFamilyShippingSchema = z.object({
  familyId: z.string(),
  familyName: z.string(),
  contactName: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  deliveryNotes: z.string().optional(),
});

export type DonorClaimFamilyShipping = z.infer<
  typeof DonorClaimFamilyShippingSchema
>;