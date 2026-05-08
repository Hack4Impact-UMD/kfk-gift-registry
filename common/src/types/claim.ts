import { z } from "zod";

export const ClaimPurchaseConfirmationSchema = z.object({
  date: z.string(),
  documentationUrl: z.string(),
  verified: z.boolean(),
  trackingNumber: z.string().optional(),
});

export type ClaimPurchaseConfirmation = z.infer<typeof ClaimPurchaseConfirmationSchema>;

export const DeliveryConfirmationSchema = z.object({
  date: z.string(),
  documentationUrl: z.string(),
  verified: z.boolean(),
});

export type DeliveryConfirmation = z.infer<typeof DeliveryConfirmationSchema>;

export const DonorClaimSchema = z.object({
  id: z.string(),
  claimType: z.literal("donor"),
  giftId: z.string(),
  childId: z.string(),
  donorId: z.string(),
  driveId: z.string(),
  organizationName: z.string().optional(),
  claimedAt: z.string(),
  purchaseConfirmation: ClaimPurchaseConfirmationSchema.optional(),
  deliveryConfirmed: DeliveryConfirmationSchema.optional(),
  receivedAt: z.string().optional(),
  thankYouNote: z.string().optional(),
  privateNotes: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  active: z.boolean(),
});

export type DonorClaim = z.infer<typeof DonorClaimSchema>;

export const KFKClaimSchema = z.object({
  id: z.string(),
  claimType: z.literal("kfk"),
  giftId: z.string(),
  childId: z.string(),
  driveId: z.string(),
  organizationName: z.string().optional(),
  claimedAt: z.string(),
  purchaseConfirmation: ClaimPurchaseConfirmationSchema.optional(),
  deliveryConfirmed: DeliveryConfirmationSchema.optional(),
  receivedAt: z.string().optional(),
  thankYouNote: z.string().optional(),
  privateNotes: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  active: z.boolean(),
});

export type KFKClaim = z.infer<typeof KFKClaimSchema>;

export const ClaimSchema = z.discriminatedUnion("claimType", [
  DonorClaimSchema,
  KFKClaimSchema,
]);

export type Claim = z.infer<typeof ClaimSchema>;
