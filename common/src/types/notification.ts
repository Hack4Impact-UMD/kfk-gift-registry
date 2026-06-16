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
