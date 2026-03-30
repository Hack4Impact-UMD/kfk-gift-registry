import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type {
  ChildrenFormData,
  ConsentFormData,
  GeneralInfoFormData,
  GiftsFormData,
} from "@/lib/formSchemas";
import {
  childrenFormDefaults,
  consentFormDefaults,
  generalInfoFormDefaults,
  giftsFormDefaults,
} from "@/lib/formSchemas";

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

const formLocalStorageKey = (driveId: string) => `family-form-${driveId}`;

function loadLocalStorageFormState(driveId: string): FamilyFormState {
  const key = formLocalStorageKey(driveId);
  const value = localStorage.getItem(key);
  if (!value) return {};

  try {
    const saved = JSON.parse(value) as FamilyFormState;

    return {
      consentScreen: {
        ...consentFormDefaults,
        ...saved.consentScreen,
      },
      children: {
        ...childrenFormDefaults,
        ...saved.children,
      },
      generalInfo: {
        ...generalInfoFormDefaults,
        ...saved.generalInfo,
      },
      gifts: {
        ...giftsFormDefaults,
        ...saved.gifts,
      },
    };
  } catch {
    return {};
  }
}

const FORM_LOCAL_SAVE_DEBOUNCE = 500;

export function FormProvider({
  children,
  driveId,
}: {
  children: ReactNode;
  driveId: string;
}) {
  const [formState, setFormState] = useState<FamilyFormState>(
    loadLocalStorageFormState(driveId),
  );

  useEffect(() => {
    const ref = setTimeout(() => {
      localStorage.setItem(
        formLocalStorageKey(driveId),
        JSON.stringify(formState),
      );
    }, FORM_LOCAL_SAVE_DEBOUNCE);
    return () => clearTimeout(ref);
  }, [formState, driveId]);

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
    if (typeof window !== "undefined") {
      localStorage.removeItem(formLocalStorageKey(driveId));
    }
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
