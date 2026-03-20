import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const addressSchema = z.object({
  street: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
});

const generalInfoSchema = z.object({
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: addressSchema,
  privateNotes: z.string().optional(),
});

const childInfoSchema = z.object({
  name: z.string(),
  age: z.string(),
  diagnosis: z.string().optional(),
  hospitalTreatedAt: z.string().optional(),
  socialWorkerName: z.string().optional(),
  photoUrl: z.string().optional(),
  status: z.string(),
  treatmentLength: z.string().optional(),
  blurb: z.string().optional(),
  isSibling: z.boolean().optional(),
});

const childrenFormSchema = z.object({
  numChildren: z.coerce.number(),
  children: z.array(childInfoSchema),
  additionalNotes: z.string().optional(),
  consentPhotosPublic: z.boolean(),
});

const giftSelectionSchema = z.object({
  giftUrl: z.string().url().optional(),
  giftName: z.string().optional(),
});

const childGiftSelectionSchema = z.object({
  childName: z.string(),
  gifts: z.array(giftSelectionSchema),
  backupGifts: z.array(giftSelectionSchema).optional(),
  verified: z.boolean(),
});

const giftsFormSchema = z.object({
  giftSelections: z.array(childGiftSelectionSchema),
});

const familyFormStateSchema = z.object({
  generalInfo: generalInfoSchema.optional(),
  children: childrenFormSchema.optional(),
  gifts: giftsFormSchema.optional(),
  consentScreen: z.boolean().optional(),
});

export type FamilyFormInput = z.infer<typeof familyFormStateSchema>; // just extracts the ts type based on zod schema

export default createServerFn({ method: "POST" })
  .inputValidator(familyFormStateSchema)
  .handler(async ({ data }) => {
    const formData = data as FamilyFormInput;

    if (!formData.generalInfo) throw new Error("General information is required");
    if (!formData.children?.children.length) throw new Error("At least one child is required");
    if (!formData.gifts?.giftSelections.length) throw new Error("Gift selections are required");

    // TODO: Implement family + child document creation (Commit 2)
    // TODO: Implement gift document creation (Commit 3)
    // TODO: Implement family link generation (Commit 4)

    throw new Error("NOT YET IMPLEMENTED");
  }
);