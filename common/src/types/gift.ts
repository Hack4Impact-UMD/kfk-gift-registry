import { z } from "zod";
import {
  GiftFamilyPublicNotesSchema,
  RequiredGiftTitleSchema,
} from "../validation";

export const GiftStatusSchema = z.enum([
  "AVAILABLE",
  "CLAIMED",
  "PURCHASED",
  "DELIVERED",
  "RECEIVED",
]);

export type GiftStatus = z.infer<typeof GiftStatusSchema>;

export const ClaimTypeSchema = z.enum(["donor", "kfk"]);

export type ClaimType = z.infer<typeof ClaimTypeSchema>;

export const GiftSchema = z.object({
  id: z.string(),
  childId: z.string(),
  familyId: z.string(),
  giftDrive: z.string(),
  title: RequiredGiftTitleSchema,
  productUrl: z.string(),
  listedPrice: z.number().optional(),
  status: GiftStatusSchema,
  claimedByDonorId: z.string().optional(),
  createdAt: z.iso.datetime(),
  familyPublicNotes: GiftFamilyPublicNotesSchema.optional(),
  privateNotes: z.string().optional(),
  backup: z.boolean(),
  active: z.boolean(),
});

export type Gift = z.infer<typeof GiftSchema>;
