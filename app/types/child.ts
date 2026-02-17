export type TreatmentLevel = number;

export type ChildCategory = "warrior" | "super_sib";


export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  category: ChildCategory;
  treatmentLevel: TreatmentLevel;
  familyId: string;
  approved: boolean;
  createdAt: string;
  hospital: string;
  childSocialWorker: string;
  giftDrive: string;
  privateNotes?: string;
}

