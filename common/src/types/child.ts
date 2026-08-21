import { z } from "zod";
import { ChildPublicBlurbSchema } from "../validation.js";

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

export const TreatmentLevelSchema = z.number().int().min(0).max(3);

export const treatmentLevelToLetter = (level: TreatmentLevel) =>
  String.fromCharCode(65 + level);

export const letterToTreatmentLevel = (letter: string): TreatmentLevel =>
  letter.toUpperCase().charCodeAt(0) - 65;

export const TREATMENT_LEVEL_OPTIONS: Array<"A" | "B" | "C" | "D"> = [
  "A",
  "B",
  "C",
  "D",
];

export const UNKNOWN_TREATMENT_LEVEL_OPTION = "Unknown";

export const TREATMENT_LEVEL_SELECT_OPTIONS: Array<string> = [
  ...TREATMENT_LEVEL_OPTIONS,
  UNKNOWN_TREATMENT_LEVEL_OPTION,
];

// Default severity level by status, per the family-form intake rubric.
// Statuses that depend on a sibling's status (sibling_in_treatment,
// bereaved_sibling) aren't covered here — staff assign those manually.
const STATUS_TO_DEFAULT_TREATMENT_LEVEL: Partial<
  Record<ChildStatus, TreatmentLevel>
> = {
  recently_diagnosed_relapse: letterToTreatmentLevel("A"),
  "diagnosed_in_treatment_1yr+": letterToTreatmentLevel("B"),
  recently_off_treatment: letterToTreatmentLevel("C"),
  "off_treatment_5yr+": letterToTreatmentLevel("C"),
  "bereaved_sibling_5yr+": letterToTreatmentLevel("D"),
};

export const deriveDefaultTreatmentLevel = (
  status: ChildStatus,
): TreatmentLevel | undefined => STATUS_TO_DEFAULT_TREATMENT_LEVEL[status];

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
