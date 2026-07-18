import { z } from "zod";

export const EmailJobStatusSchema = z.enum([
  "pending",
  "scheduling",
  "scheduled",
  "sent",
  "failed",
  "cancelled",
]);

export type EmailJobStatus = z.infer<typeof EmailJobStatusSchema>;

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

export const EmailJobSchema = z.object({
  id: z.string(),
  to: z.email(),
  subject: z.string(),
  html: z.string(),
  sendAt: z.iso.datetime(),
  status: EmailJobStatusSchema,
  /**
   * Opaque, caller-defined data the scheduler may consult for its own
   * delivery decisions (e.g. cancellation). The scheduler must not use
   * this to select or render content.
   */
  metadata: z.record(z.string(), z.unknown()).optional(),
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
