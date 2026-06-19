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

export const DonorPostClaimConfirmationPayloadSchema = z.object({
  donorId: z.string(),
  donorName: z.string(),
  donorEmail: z.email(),
  driveId: z.string(),
  claimIds: z.array(z.string()).min(1),
  giftIds: z.array(z.string()).min(1),
  claimedAt: z.iso.datetime(),
  gifts: z.array(DonorClaimGiftSummarySchema).min(1),
  shippingByFamily: z.array(DonorClaimFamilyShippingSchema).min(1),
});

export type DonorPostClaimConfirmationPayload = z.infer<
  typeof DonorPostClaimConfirmationPayloadSchema
>;

export const DonorPurchaseReminderPayloadSchema = z.object({
  donorId: z.string(),
  donorName: z.string(),
  donorEmail: z.email(),
  driveId: z.string(),
  claimIds: z.array(z.string()).min(1),
  giftIds: z.array(z.string()).min(1),
  claimedAt: z.iso.datetime(),
  reminderReason: z.string().optional(),
  gifts: z.array(DonorClaimGiftSummarySchema).min(1),
  shippingByFamily: z.array(DonorClaimFamilyShippingSchema).min(1),
});

export type DonorPurchaseReminderPayload = z.infer<
  typeof DonorPurchaseReminderPayloadSchema
>;

export const EmailJobPayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("DONOR_POST_CLAIM_CONFIRMATION"),
    data: DonorPostClaimConfirmationPayloadSchema,
  }),
  z.object({
    type: z.literal("DONOR_PURCHASE_REMINDER"),
    data: DonorPurchaseReminderPayloadSchema,
  }),
]);

export type EmailJobPayload = z.infer<typeof EmailJobPayloadSchema>;

export const EmailJobSchema = z.object({
  id: z.string(),
  type: EmailJobTypeSchema,
  to: z.email(),
  subject: z.string(),
  payload: EmailJobPayloadSchema,
  sendAt: z.iso.datetime(),
  status: EmailJobStatusSchema,
  resendEmailId: z.string().optional(),
  scheduledAt: z.iso.datetime().optional(),
  sentAt: z.iso.datetime().optional(),
  cancelledAt: z.iso.datetime().optional(),
  failedAt: z.iso.datetime().optional(),
  lastError: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type EmailJob = z.infer<typeof EmailJobSchema>;
