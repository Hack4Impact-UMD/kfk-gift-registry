import { z } from "zod";
import {
  AMAZON_PRODUCT_URL_INVALID_MESSAGE,
  ChildStatusSchema,
  GiftFamilyPublicNotesSchema,
  GIFT_PRICE_INVALID_MESSAGE,
  GIFT_TITLE_REQUIRED_MESSAGE,
  GiftTitleSchema,
  MAX_GIFT_PRICE,
  isValidAmazonProductUrl,
} from "common";
import type { ChildStatus } from "common";

// Ordered to match display order in the form.
export const CHILD_STATUS_VALUES = ChildStatusSchema.options;

export const CHILD_STATUS_LABELS: Record<ChildStatus, string> = {
  recently_diagnosed_relapse:
    "Recently diagnosed or relapsed with cancer (within 1 year)",
  "diagnosed_in_treatment_1yr+":
    "Diagnosed and has been in treatment for more than 1 year",
  recently_off_treatment: "Recently off treatment (up to 5 years)",
  "off_treatment_5yr+": "Off treatment (more than 5 years)",
  sibling_in_treatment:
    "Sibling of child diagnosed with cancer (in or off treatment)",
  bereaved_sibling: "Bereaved sibling (up to 5 years)",
  "bereaved_sibling_5yr+": "Bereaved sibling for more than 5 years",
};

export const SIBLING_CHILD_STATUSES: ReadonlySet<ChildStatus> = new Set([
  "sibling_in_treatment",
  "bereaved_sibling",
  "bereaved_sibling_5yr+",
]);

export function isSiblingChildStatus(status: ChildStatus | undefined) {
  return status !== undefined && SIBLING_CHILD_STATUSES.has(status);
}

export const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

export const consentSchema = z.object({
  consentGiven: z.boolean().refine((val) => val === true, {
    message: "You must agree to share your address to continue",
  }),
  shareMailingAddress: z.boolean().refine((val) => val === true, {
    message: "You must agree to share your mailing address",
  }),
});

export const consentFormDefaults: ConsentFormData = {
  consentGiven: false,
  shareMailingAddress: false,
};

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
      .trim()
      .min(1, "Phone number is required")
      .regex(/^[\d\s\-()]+$/, "Please enter a valid phone number")
      .refine((value) => value.replace(/\D/g, "").length === 10, {
        message: "Please enter a valid phone number",
      }),
    phoneNumberConfirm: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(/^[\d\s\-()]+$/, "Please enter a valid phone number")
      .refine((value) => value.replace(/\D/g, "").length === 10, {
        message: "Please enter a valid phone number",
      }),
    streetAddress: z
      .string()
      .min(1, "Street address is required")
      .max(200, "Address is too long"),
    addressLine2: z
      .string()
      .max(200, "Address is too long")
      .optional()
      .or(z.literal("")),
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
      .regex(
        /^\d{5}(-\d{4})?$/,
        "Please enter a valid zip code (e.g., 12345 or 12345-6789)",
      ),
  })
  .refine((data) => data.email === data.emailConfirm, {
    message: "Emails do not match",
    path: ["emailConfirm"],
  })
  .refine((data) => data.phoneNumber === data.phoneNumberConfirm, {
    message: "Phone Numbers do not match",
    path: ["phoneNumberConfirm"],
  });

export const generalInfoFormDefaults: GeneralInfoFormData = {
  city: "",
  email: "",
  emailConfirm: "",
  parentName: "",
  state: "",
  streetAddress: "",
  zipCode: "",
  addressLine2: "",
  phoneNumber: "",
  phoneNumberConfirm: "",
};

// Accepts an empty string, a data URL (local preview), or an https:// URL (after Firebase upload)
const photoUrlSchema = z
  .union([
    z.literal(""),
    z.string().startsWith("data:", "Must be a valid image"),
    z.string().url("Must be a valid URL"),
  ])
  .optional();

const childAgeSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .refine((value) => value.length > 0, {
    message: "Age is required",
  })
  .refine((value) => {
    const age = Number(value);
    return Number.isInteger(age) && age >= 1 && age <= 18;
  }, "Age must be between 1 and 18");

export const childInfoSchema = z.object({
  name: z
    .string()
    .min(1, "Child's name is required")
    .max(100, "Name is too long"),
  age: childAgeSchema,
  status: z.enum(CHILD_STATUS_VALUES),
  isSibling: z.boolean(),
  // Not required for siblings
  diagnosis: z
    .string()
    .max(200, "Diagnosis is too long")
    .optional()
    .or(z.literal("")),
  hospitalTreatedAt: z
    .string()
    .max(200, "Hospital name is too long")
    .optional()
    .or(z.literal("")),
  socialWorkerName: z
    .string()
    .max(100, "Name is too long")
    .optional()
    .or(z.literal("")),
  treatmentLength: z.string().optional().or(z.literal("")),
  photoUrl: photoUrlSchema,
  blurb: z.string().max(150, "Blurb must be at most 150 characters").optional(),
});

export const defaultChild = (): ChildInfo => ({
  name: "",
  age: "",
  diagnosis: "",
  hospitalTreatedAt: "",
  socialWorkerName: "",
  photoUrl: "",
  status: "recently_diagnosed_relapse",
  treatmentLength: "",
  blurb: "",
  isSibling: false,
});

export const childrenFormDefaults: ChildrenFormData = {
  numChildren: 1,
  children: [defaultChild()],
  additionalNotes: "",
  consentPhotosPublic: false,
};

export const childrenFormSchema = z
  .object({
    numChildren: z.coerce.number().min(1).max(10),
    children: z.array(childInfoSchema).min(1, "At least one child is required"),
    additionalNotes: z.string().optional().or(z.literal("")),
    consentPhotosPublic: z.boolean(),
  })
  .refine((data) => data.children.length === data.numChildren, {
    message: "Number of children must match the count field",
    path: ["children"],
  });

const PRICE_REQUIRED_MESSAGE = "Price is required";
const URL_REQUIRED_MESSAGE = "URL is required";

function hasValidPrice(value: string) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 && price <= MAX_GIFT_PRICE;
}

const baseGiftSchema = z.object({
  giftName: GiftTitleSchema,
  giftUrl: z.string().trim(),
  listedPrice: z.string().trim(),
  familyPublicNotes: GiftFamilyPublicNotesSchema.optional(),
});

const optionalGiftSchema = baseGiftSchema.superRefine((data, ctx) => {
  const hasName = data.giftName.trim().length > 0;
  const hasUrl = data.giftUrl.trim().length > 0;
  const hasPrice = data.listedPrice.length > 0;
  const hasNotes = (data.familyPublicNotes?.trim() ?? "").length > 0;

  const isBlank = !hasName && !hasUrl && !hasPrice && !hasNotes;

  if (isBlank) return;

  if (!hasName) {
    ctx.addIssue({
      code: "custom",
      path: ["giftName"],
      message: GIFT_TITLE_REQUIRED_MESSAGE,
    });
  }

  if (!hasUrl) {
    ctx.addIssue({
      code: "custom",
      path: ["giftUrl"],
      message: URL_REQUIRED_MESSAGE,
    });
  } else if (!isValidAmazonProductUrl(data.giftUrl)) {
    ctx.addIssue({
      code: "custom",
      path: ["giftUrl"],
      message: AMAZON_PRODUCT_URL_INVALID_MESSAGE,
    });
  }

  if (!hasPrice) {
    ctx.addIssue({
      code: "custom",
      path: ["listedPrice"],
      message: PRICE_REQUIRED_MESSAGE,
    });
    return;
  }

  if (!hasValidPrice(data.listedPrice)) {
    ctx.addIssue({
      code: "custom",
      path: ["listedPrice"],
      message: GIFT_PRICE_INVALID_MESSAGE,
    });
  }
});

const requiredGiftSchema = baseGiftSchema.superRefine((data, ctx) => {
  const hasName = data.giftName.trim().length > 0;
  const hasUrl = data.giftUrl.trim().length > 0;
  const hasPrice = data.listedPrice.length > 0;

  if (!hasName) {
    ctx.addIssue({
      code: "custom",
      path: ["giftName"],
      message: GIFT_TITLE_REQUIRED_MESSAGE,
    });
  }

  if (!hasUrl) {
    ctx.addIssue({
      code: "custom",
      path: ["giftUrl"],
      message: URL_REQUIRED_MESSAGE,
    });
  } else if (!isValidAmazonProductUrl(data.giftUrl)) {
    ctx.addIssue({
      code: "custom",
      path: ["giftUrl"],
      message: AMAZON_PRODUCT_URL_INVALID_MESSAGE,
    });
  }

  if (!hasPrice) {
    ctx.addIssue({
      code: "custom",
      path: ["listedPrice"],
      message: PRICE_REQUIRED_MESSAGE,
    });
    return;
  }

  if (!hasValidPrice(data.listedPrice)) {
    ctx.addIssue({
      code: "custom",
      path: ["listedPrice"],
      message: GIFT_PRICE_INVALID_MESSAGE,
    });
  }
});

export const childGiftSchema = z.object({
  childName: z.string(),
  gifts: z.tuple([requiredGiftSchema, optionalGiftSchema, optionalGiftSchema]),
  backupGifts: z.tuple([requiredGiftSchema, requiredGiftSchema]),
});

export const giftsFormSchema = z.object({
  giftSelections: z.array(childGiftSchema),
});

export const giftsFormDefaults: GiftsFormData = {
  giftSelections: [],
};

export const SECTION_SCHEMAS = {
  generalInfo: generalInfoSchema,
  children: childrenFormSchema,
  gifts: giftsFormSchema,
  consentScreen: consentSchema,
} as const;

export type ConsentFormData = z.infer<typeof consentSchema>;
export type GeneralInfoFormData = z.infer<typeof generalInfoSchema>;
export type ChildInfo = z.infer<typeof childInfoSchema>;
export type ChildrenFormData = z.infer<typeof childrenFormSchema>;
export type GiftsFormData = z.infer<typeof giftsFormSchema>;
export type ChildGiftSelections = z.infer<typeof childGiftSchema>;
