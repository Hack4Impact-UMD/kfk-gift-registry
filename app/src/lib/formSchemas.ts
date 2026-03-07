import { z } from "zod";

export const consentSchema = z.object({
  consentGiven: z.boolean().refine((val) => val === true, {
    message: "You must agree to share your address to continue",
  }),
  shareMailingAddress: z.boolean().refine((val) => val === true, {
    message: "You must agree to share your mailing address",
  }),
});

export const generalInfoSchema = z
  .object({
    parentName: z
      .string()
      .min(1, "Parent/Guardian name is required")
      .max(100, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    emailConfirm: z
      .string()
      .min(1, "Please confirm your email")
      .email("Please enter a valid email address"),
    phoneNumber: z
      .string()
      .regex(/^[\d\s\-\(\)]+$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    phoneNumberConfirm: z
      .string()
      .regex(/^[\d\s\-\(\)]+$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    streetAddress: z
      .string()
      .min(1, "Street address is required")
      .max(200, "Address is too long"),
    addressLine2: z.string().max(200, "Address is too long").optional().or(z.literal("")),
    city: z
      .string()
      .min(1, "City is required")
      .max(100, "City name is too long"),
    state: z
      .string()
      .min(1, "State is required")
      .length(2, "Please use 2-letter state code (e.g., MD)"),
    zipCode: z
      .string()
      .min(1, "Zip code is required")
      .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid zip code (e.g., 12345 or 12345-6789)"),
  })
  .refine((data) => data.email === data.emailConfirm, {
    message: "Emails do not match",
    path: ["emailConfirm"],
  })
  .refine((data) => data.phoneNumber === data.phoneNumberConfirm, {
    message: "Phone Numbers do not match",
    path: ["phoneNumberConfirm"],
  });


// Accepts an empty string, a data URL (local preview), or an https:// URL (after Firebase upload)
const photoUrlSchema = z.union([
  z.literal(""),
  z.string().startsWith("data:", "Must be a valid image"),
  z.string().url("Must be a valid URL"),
]).optional();

export const childInfoSchema = z.object({
  name: z.string().min(1, "Child's name is required").max(100, "Name is too long"),
  age: z.string().min(1, "Age is required"),
  diagnosis: z.string().min(1, "Diagnosis is required").max(200, "Diagnosis is too long"),
  hospitalTreatedAt: z.string().min(1, "Hospital name is required").max(200, "Hospital name is too long"),
  socialWorkerName: z.string().min(1, "Social worker name is required").max(100, "Name is too long"),
  photoUrl: photoUrlSchema,
});

export const siblingInfoSchema = z.object({
  name: z.string().min(1, "Sibling's name is required").max(100, "Name is too long"),
  age: z.string().min(1, "Age is required"),
  photoUrl: photoUrlSchema,
});

export const childrenFormSchema = z.object({
  hasMultipleChildren: z.boolean(),
  children: z.array(childInfoSchema).min(1, "At least one child is required"),
  // coerce handles the string values that come from FormSelect ("2", "3", "4")
  numChildren: z.coerce.number().min(1).max(4),
  hasSiblings: z.boolean(),
  // coerce handles the string values that come from FormSelect ("1", "2", ...)
  numSiblings: z.coerce.number().min(0).max(10),
  siblings: z.array(siblingInfoSchema),
  consentPhotosPublic: z.boolean(),
}).refine((data) => {
  const expected = data.hasMultipleChildren ? data.numChildren : 1;
  return data.children.length === expected;
}, {
  message: "Number of children filled must match selected count",
  path: ["children"],
});

const giftSchema = z.object({
  giftName: z.string(),
  giftUrl: z.string(),
}).refine((data) => {
  const hasName = data.giftName.trim().length > 0;
  const hasUrl = data.giftUrl.trim().length > 0;
  return (hasName && hasUrl) || (!hasName && !hasUrl);
}, {
  message: "Both Name and URL are required if this gift is selected",
});

export const childGiftSchema = z.object({
  childName: z.string(),
  gifts: z.tuple([
    z.object({
      giftName: z.string().min(1, "Gift Name is required"),
      giftUrl: z.string().url("Valid URL is required"),
    }),
    giftSchema,
    giftSchema, 
  ]),
  backupGifts: z.tuple([
    z.object({
      giftName: z.string().min(1, "Gift Name is required"),
      giftUrl: z.string().url("Valid URL is required"),
    }),
    z.object({
      giftName: z.string().min(1, "Gift Name is required"),
      giftUrl: z.string().url("Valid URL is required"),
    }),
  ]),
  verified: z
    .boolean()
    .refine((val) => val === true, {
    message: "You must agree the conditions",
    }),
});

export const giftsFormSchema = z.object({
  giftSelections: z.array(childGiftSchema),
});


export const SECTION_SCHEMAS = {
  generalInfo: generalInfoSchema,
  children: childrenFormSchema,
  gifts: giftsFormSchema,
  consentScreen: consentSchema,
} as const;