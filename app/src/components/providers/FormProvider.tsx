import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Define the structure for each form section
export type ConsentFormData = {
  consentGiven: boolean;
  shareMailingAddress: boolean;
};

export type GeneralInfoFormData = {
  parentName: string;
  email: string;
  emailConfirm: string;
  phoneNumber?: string;  // Made optional to match Zod
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
};

export type ChildInfo = {
  name: string;
  age: string;
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

export type ChildrenFormData = {
  hasMultipleChildren: boolean;
  numChildren: number;
  children: Array<ChildInfo>;
  hasSiblings: boolean;
  numSiblings: number;
  siblings: Array<SiblingInfo>;
  consentPhotosPublic: boolean;
};

export type GiftSelection = {
  giftUrl: string;
  giftName: string;
};

export type ChildGiftSelections = {
  childName: string;
  gifts: Array<GiftSelection>;
  backupGifts: Array<GiftSelection>;
  verified: boolean;
};

export type GiftsFormData = {
  giftSelections: Array<ChildGiftSelections>;
};

// Central form state - organized by section
export type FamilyFormState = {
  consentScreen?: ConsentFormData;
  generalInfo?: GeneralInfoFormData;
  children?: ChildrenFormData;
  gifts?: GiftsFormData;
};

type FormContextType = {
  formState: FamilyFormState;
  updateSection: <K extends keyof FamilyFormState>(
    section: K,
    data: FamilyFormState[K]
  ) => void;
  resetForm: () => void;
  isComplete: (section: keyof FamilyFormState) => boolean;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formState, setFormState] = useState<FamilyFormState>({});

  const updateSection = <K extends keyof FamilyFormState>(
    section: K,
    data: FamilyFormState[K]
  ) => {
    setFormState((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const resetForm = () => {
    setFormState({});
  };

  const isComplete = (section: keyof FamilyFormState): boolean => {
    return formState[section] !== undefined;
  };

  return (
    <FormContext.Provider value={{ formState, updateSection, resetForm, isComplete }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within FormProvider");
  }
  return context;
}