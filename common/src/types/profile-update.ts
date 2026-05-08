import { z } from "zod";
import { GiftSchema } from "./gift.js";
import { ChildSchema } from "./child.js";

export const ProfileUpdateGiftSchema = GiftSchema.pick({
  id: true,
  title: true,
  productUrl: true,
  backup: true,
  active: true,
  privateNotes: true,
});

export type ProfileUpdateGift = z.infer<typeof ProfileUpdateGiftSchema>;

export const ChildProfileUpdateDataSchema = ChildSchema.omit({ id: true }).partial();

export type ChildProfileUpdateData = z.infer<typeof ChildProfileUpdateDataSchema>;

export const ProfileUpdateStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export type ProfileUpdateStatus = z.infer<typeof ProfileUpdateStatusSchema>;

export const ChildProfileUpdateSchema = z.object({
  id: z.string(),
  childId: z.string(),
  requestedBy: z.string(),
  changes: ChildProfileUpdateDataSchema,
  status: ProfileUpdateStatusSchema,
  requestedAt: z.string(),
  reviewedAt: z.string().optional(),
  appliedAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type ChildProfileUpdate = z.infer<typeof ChildProfileUpdateSchema>;
