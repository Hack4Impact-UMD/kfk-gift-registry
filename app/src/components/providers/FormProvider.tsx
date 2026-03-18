import { createContext, useContext, useState } from "react";
import type z from "zod";
import type { ReactNode } from "react";
import type { childInfoSchema, childrenFormSchema, consentSchema, generalInfoSchema, giftsFormSchema } from "@/lib/formSchemas";

export type ConsentFormData = z.infer<typeof consentSchema>;
export type GeneralInfoFormData = z.infer<typeof generalInfoSchema>;
export type ChildInfo = z.infer<typeof childInfoSchema>;
export type ChildrenFormData = z.infer<typeof childrenFormSchema>;

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

export type GiftsFormData = z.infer<typeof giftsFormSchema>;

// Central form state - organized by section
export type FamilyFormState = {
  consentScreen?: ConsentFormData;
  generalInfo?: GeneralInfoFormData;
  children?: ChildrenFormData;
  gifts?: GiftsFormData;
};

type FormContextType = {
  formState: FamilyFormState;
  updateSection: <TFormKey extends keyof FamilyFormState>(
    section: TFormKey,
    data: FamilyFormState[TFormKey],
  ) => void;
  resetForm: () => void;
  isComplete: (section: keyof FamilyFormState) => boolean;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formState, setFormState] = useState<FamilyFormState>({});

  const updateSection = <TFromKey extends keyof FamilyFormState>(
    section: TFromKey,
    data: FamilyFormState[TFromKey],
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
    <FormContext.Provider
      value={{ formState, updateSection, resetForm, isComplete }}
    >
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
