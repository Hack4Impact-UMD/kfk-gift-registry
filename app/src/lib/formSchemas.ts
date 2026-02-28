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
    path: ["emailConfirm"], // Show error on emailConfirm field
  })
  .refine((data) => data.phoneNumber === data.phoneNumberConfirm, {
    message: "Phone Numbers do not match",
    path: ["emailConfirm"], // Show error on emailConfirm field
  });


export const childInfoSchema = z.object({
  name: z.string().min(1, "Child's name is required").max(100, "Name is too long"),
  age: z.string().min(1, "Age is required"),
  diagnosis: z.string().min(1, "Diagnosis is required").max(200, "Diagnosis is too long"),
  hospitalTreatedAt: z.string().min(1, "Hospital name is required").max(200, "Hospital name is too long"),
  socialWorkerName: z.string().min(1, "Social worker name is required").max(100, "Name is too long"),
  photoUrl: z.string().url("Invalid photo URL").optional().or(z.literal("")),
});

export const siblingInfoSchema = z.object({
  name: z.string().min(1, "Sibling's name is required").max(100, "Name is too long"),
  age: z.string().min(1, "Age is required"),
  photoUrl: z.string().url("Invalid photo URL").optional().or(z.literal("")),
});

export const childrenFormSchema = z.object({
  hasMultipleChildren: z.boolean(),
  children: z.array(childInfoSchema).min(1, "At least one child is required"),
  hasSiblings: z.boolean(),
  numSiblings: z.number().min(0).max(10),
  siblings: z.array(siblingInfoSchema),
  consentPhotosPublic: z.boolean(),
});