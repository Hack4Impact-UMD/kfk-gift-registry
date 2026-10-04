import { z } from "zod";
import {
  GiftFamilyPublicNotesSchema,
  RequiredGiftTitleSchema,
} from "../validation.js";

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
  sortOrder: z.number().int().optional(),
});

export type Gift = z.infer<typeof GiftSchema>;

// Staff-set sortOrder first; gifts never reordered fall back to id order,
// which is creation order since gift ids are uuidv7.
export function compareGiftOrder(
  a: Pick<Gift, "id" | "sortOrder">,
  b: Pick<Gift, "id" | "sortOrder">,
) {
  const aOrder = a.sortOrder ?? Number.POSITIVE_INFINITY;
  const bOrder = b.sortOrder ?? Number.POSITIVE_INFINITY;
  if (aOrder !== bOrder) return aOrder < bOrder ? -1 : 1;
  return a.id.localeCompare(b.id);
}
