import { z } from "zod";

export const FamilyNotificationTypeSchema = z.enum([
  "GIFT_CLAIMED",
  "GIFT_DELIVERED",
  "GIFT_UPDATED",
]);

export type FamilyNotificationType = z.infer<
  typeof FamilyNotificationTypeSchema
>;

export const FamilyNotificationSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  childId: z.string(),
  type: FamilyNotificationTypeSchema,
  message: z.string(),
  giftId: z.string(),
  driveId: z.string(),
  createdAt: z.iso.datetime(),
  read: z.boolean(),
});

export type FamilyNotification = z.infer<typeof FamilyNotificationSchema>;

export const DonorNotificationTypeSchema = z.enum([
  "PURCHASE_CONFIRMATION_NEEDED",
  "DELIVERY_CONFIRMATION_NEEDED",
]);

export type DonorNotificationType = z.infer<typeof DonorNotificationTypeSchema>;

export const DonorNotificationSchema = z.object({
  id: z.string(),
  donorId: z.string(),
  childId: z.string(),
  giftId: z.string(),
  claimId: z.string(),
  driveId: z.string(),
  type: DonorNotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  createdAt: z.iso.datetime(),
  read: z.boolean(),
  actionCompleted: z.boolean(),
});

export type DonorNotification = z.infer<typeof DonorNotificationSchema>;
