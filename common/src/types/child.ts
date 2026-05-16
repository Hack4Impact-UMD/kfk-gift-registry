import { z } from "zod";
import { ChildPublicBlurbSchema } from "../validation";

export const ChildStatusSchema = z.enum([
  "recently_diagnosed_relapse",
  "diagnosed_in_treatment_1yr+",
  "recently_off_treatment",
  "off_treatment_5yr+",
  "sibling_in_treatment",
  "bereaved_sibling",
  "bereaved_sibling_5yr+",
]);

export type ChildStatus = z.infer<typeof ChildStatusSchema>;

export const ChildCategorySchema = z.enum(["warrior", "super_sib"]);

export type ChildCategory = z.infer<typeof ChildCategorySchema>;

export const TimePeriodSchema = z.enum(["<6m", "6m-1y", "1-2y", "3-4y", "5+y"]);

export type TimePeriod = z.infer<typeof TimePeriodSchema>;

export type TreatmentLevel = number;

export const TreatmentLevelSchema = z.number();

export const treatmentLevelToLetter = (level: TreatmentLevel) =>
  String.fromCharCode(65 + level);

/**
 * Types:
 *- Recently diagnosed or relapse with cancer (within 1 year)
 *- Diagnosed and has been in treatment for more than 1 year
 *- Recently off treatment (within 1 year)
 *- Off treatment (more than 1 year)
 *- Sibling of child diagnosed with cancer (in or off treatment)
 *- Bereaved sibling
 */
export const ChildSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: ChildStatusSchema,
  photoUrl: z.string().optional(),
  category: ChildCategorySchema,
  treatmentLevel: TreatmentLevelSchema.optional(),
  familyId: z.string(),
  diagnosis: z.string(),
  diagnosisLengthYears: TimePeriodSchema.optional(),
  offTreatmentDurationYears: TimePeriodSchema.optional(),
  livesAtHome: z.boolean(),
  publicBlurb: ChildPublicBlurbSchema.optional(),
  createdAt: z.iso.datetime(),
  hospital: z.string(),
  age: z.number(),
  childSocialWorker: z.string(),
  giftDrive: z.string(),
  staffPrivateNotes: z.string().optional(),
  published: z.boolean(),
});

export type Child = z.infer<typeof ChildSchema>;
