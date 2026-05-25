import { z } from "zod";

export const NotificationTypeSchema = z.enum([
  "GIFT_CLAIMED",
  "GIFT_DELIVERED",
  "GIFT_UPDATED",
]);

export type NotificationType = z.infer<typeof NotificationTypeSchema>;