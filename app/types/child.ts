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
  reviewStatus: {
    approved: boolean;
    lastReviewedAt?: string;
  },
  diagnosis: string;
  createdAt: string;
  hospital: string;
  age: number,
  childSocialWorker: string;
  giftDrive: string;
  privateNotes?: string;
}

