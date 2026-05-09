import { z } from "zod";

export const AddressSchema = z.object({
  street: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
});

export type Address = z.infer<typeof AddressSchema>;

export const ReviewStatusSchema = z.object({
  approved: z.boolean(),
  held: z.boolean(),
  lastReviewedAt: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().optional(),
  holdNotes: z.string().optional(),
});

export const FamilySchema = z.object({
  id: z.string(),
  contactName: z.string(),
  guardianRelationship: z.string().optional(),
  email: z.email(),
  phone: z.string(),
  address: AddressSchema,
  privateNotes: z.string().optional(),
  giftDrive: z.string(),
  createdAt: z.iso.datetime(),
  reviewStatus: ReviewStatusSchema,
});

export type Family = z.infer<typeof FamilySchema>;
