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

const formLocalStorageKey = (formLinkId: string) => `family-form-${formLinkId}`;

function loadLocalStorageFormState(formLinkId: string): FamilyFormState {
  const key = formLocalStorageKey(formLinkId);
  const value = localStorage.getItem(key);
  if (!value) return {};

  try {
    const saved = JSON.parse(value) as FamilyFormState;

    return {
      ...(saved.consentScreen && {
        consentScreen: {
          ...consentFormDefaults,
          ...saved.consentScreen,
        },
      }),
      ...(saved.children && {
        children: {
          ...childrenFormDefaults,
          ...saved.children,
        },
      }),
      ...(saved.generalInfo && {
        generalInfo: {
          ...generalInfoFormDefaults,
          ...saved.generalInfo,
        },
      }),
      ...(saved.gifts && {
        gifts: {
          ...giftsFormDefaults,
          ...saved.gifts,
        },
      }),
    };
  } catch {
    return {};
  }
}

const FORM_LOCAL_SAVE_DEBOUNCE = 500;

export function FormProvider({
  children,
  formLinkId,
}: {
  children: ReactNode;
  formLinkId: string;
}) {
  const [formState, setFormState] = useState<FamilyFormState>(
    loadLocalStorageFormState(formLinkId),
  );

  useEffect(() => {
    const ref = setTimeout(() => {
      if (Object.keys(formState).length === 0) {
        localStorage.removeItem(formLocalStorageKey(formLinkId));
        return;
      }

      // Strip photoUrl before persisting — base64 data URLs can be several MB
      // each and will blow past localStorage's ~5 MB quota. The in-memory state
      // retains the image for live previews; photos are re-selected if the user
      // navigates away and returns.
      const sanitized: FamilyFormState = {
        ...formState,
        children: formState.children
          ? {
              ...formState.children,
              children: formState.children.children.map((child) => ({
                ...child,
                photoUrl: "",
              })),
            }
          : undefined,
      };
      localStorage.setItem(
        formLocalStorageKey(formLinkId),
        JSON.stringify(sanitized),
      );
    }, FORM_LOCAL_SAVE_DEBOUNCE);
    return () => clearTimeout(ref);
  }, [formState, formLinkId]);

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
      localStorage.removeItem(formLocalStorageKey(formLinkId));
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
