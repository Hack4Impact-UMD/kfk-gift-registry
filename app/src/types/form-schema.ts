export type ChildInfo = {
  name: string;
  age: string; // Stored as string for form, convert to number when submitting
  diagnosis: string;
  hospitalTreatedAt: string;
  socialWorkerName: string;
  photoUrl?: string;
};

export type SiblingInfo = {
    name: string;
    age: string;
    photoUrl?: string;
};

export type GiftSelection = {
  giftUrl: string;
  giftName: string;
};

export type ChildGiftSelections = {
  childName: string;
  gifts: GiftSelection[];
  backupGifts: GiftSelection[];
};

export type FamilyFormData = {
  // Consent page
  consentGiven: boolean;
  shareMailingAddress: boolean;

  // General Info (Page 2)
  parentName: string;
  email: string;
  emailConfirm: string;
  phoneNumber: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;

  // Children Information (Page 3)
  hasMultipleChildren: boolean;
  children: ChildInfo[];
  hasSiblings: boolean;
  numSiblings: number;
  siblings?: SiblingInfo[];

  consentPhotosPublic: boolean;

  // Gift Selections (Page 4+)
  giftSelections: ChildGiftSelections[];
};

export const INITIAL_FORM_DATA: FamilyFormData = {
  consentGiven: false,
  shareMailingAddress: false,
  parentName: "",
  email: "",
  emailConfirm: "",
  phoneNumber: "",
  streetAddress: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  hasMultipleChildren: false,
  children: [],
  hasSiblings: false,
  numSiblings: 0,
  siblings: [],
  consentPhotosPublic: false,
  giftSelections: [],
};