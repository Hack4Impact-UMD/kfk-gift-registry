export type TreatmentLevel = number;

export const treatmentLevelToLetter = (level: TreatmentLevel) =>
  String.fromCharCode(65 + level);

export type ChildCategory = "warrior" | "super_sib";

/**
 * Types:
 *- Recently diagnosed or relapse with cancer (within 1 year)
 *- Diagnosed and has been in treatment for more than 1 year
 *- Recently off treatment (within 1 year)
 *- Off treatment (more than 1 year)
 *- Sibling of child diagnosed with cancer (in or off treatment)
 *- Bereaved sibling
 */
export type ChildStatus =
  | "recently_diagnosed_relapse"
  | "diagnosed_in_treatment_1yr+"
  | "recently_off_treatment"
  | "off_treatment_1yr+"
  | "sibling_in_treatment"
  | "bereaved_sibling";

type TimePeriod = "<6m" | "6m-1y" | "1-2y" | "3-4y" | "5+y";

export interface Child {
  id: string;
  name: string;
  status: ChildStatus;
  photoUrl?: string;
  category: ChildCategory;
  treatmentLevel?: TreatmentLevel;
  familyId: string;
  diagnosis: string;
  diagnosisLengthYears?: TimePeriod;
  offTreatmentDurationYears?: TimePeriod;
  livesAtHome: boolean;
  publicBlurb?: string;
  createdAt: string;
  hospital: string;
  age: number;
  childSocialWorker: string;
  giftDrive: string;
  staffPrivateNotes?: string;
  published: boolean; // whether the child should be shown on the storefront
}
