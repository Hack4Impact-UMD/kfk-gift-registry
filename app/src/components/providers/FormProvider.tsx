import { createContext, useContext, useState, ReactNode } from "react";
import { FamilyFormData, INITIAL_FORM_DATA } from "../../types/form-schema";

type FormContextType = {
    formData: FamilyFormData;
    updateFormData: (updates: Partial<FamilyFormData>) => void;
    resetForm: () => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
    const [formData, setFormData] = useState<FamilyFormData>(INITIAL_FORM_DATA);

    const updateFormData = (updates: Partial<FamilyFormData>) => {
        setFormData((prev) => ({
            ...prev,
            ...updates,
        }));
    };

    const resetForm = () => {
        setFormData(INITIAL_FORM_DATA);
    };

    return (
        <FormContext.Provider value={{ formData, updateFormData, resetForm }}>
            {children}
        </FormContext.Provider>
    );
}

export function useFormContext() {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error("useFormContext must be used within a FormProvider");
    }
    return context;
}