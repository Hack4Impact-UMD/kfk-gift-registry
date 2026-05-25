import { z } from "zod";

export const NotificationTypeSchema = z.enum([
  "GIFT_CLAIMED",
  "GIFT_DELIVERED",
  "GIFT_UPDATED",
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  childId: z.string(),
  type: NotificationTypeSchema,
  message: z.string(),
  giftId: z.string(),
  createdAt: z.string().datetime(),
  read: z.boolean(),
});

export type Notification = z.infer<typeof NotificationSchema>;
