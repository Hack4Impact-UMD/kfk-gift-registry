import { useForm } from "@tanstack/react-form";
import { useFormContext, type FamilyFormState } from "@/components/providers/FormProvider";
import { useNavigate } from "@tanstack/react-router";
import { consentSchema, generalInfoSchema, childrenFormSchema } from "@/lib/formSchemas";
import { useEffect } from "react";


export function useProgressBarNavigation<K extends keyof FamilyFormState>(
  sectionKey: K,
  getCurrentValues: () => FamilyFormState[K]
) {
  const { updateSection } = useFormContext();
  const navigate = useNavigate();

  const handleProgressBarNavigate = async (targetPath: string) => {
    // Get current form values
    const currentValues = getCurrentValues();
    
    // Save to form state (even if incomplete/invalid)
    updateSection(sectionKey, currentValues);
    
    // Navigate to target
    navigate({ to: targetPath as any });
  };

  return handleProgressBarNavigate;
}

export function useConsentForm() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: formState.consentScreen || {
      consentGiven: false,
      shareMailingAddress: false,
    },
    onSubmit: async ({ value }) => {
      const result = consentSchema.safeParse(value);
      if (!result.success) {
        console.error("Validation failed:", result.error);
        return;
      }

      updateSection("consentScreen", result.data);
      
      navigate({ to: "/family/form/general-info" });
    },
  });

  return form;
}

export function useGeneralInfoForm() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: formState.generalInfo || {
      parentName: "",
      email: "",
      emailConfirm: "",
      phoneNumber: "",
      phoneNumberConfirm: "",
      streetAddress: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
    },
    onSubmit: async ({ value }) => {
      const result = generalInfoSchema.safeParse(value);
      if (!result.success) {
        console.error("Validation failed:", result.error);
        return;
      }
      
      updateSection("generalInfo", result.data);
      navigate({ to: "/family/form/children" });
    },
  });

  return form;
}

export function useChildrenForm() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: formState.children || {
      hasMultipleChildren: false,
      numChildren: 1,
      children: [{
        name: "",
        age: "",
        diagnosis: "",
        hospitalTreatedAt: "",
        socialWorkerName: "",
        photoUrl: "",
      }],
      hasSiblings: false,
      numSiblings: 0,
      siblings: [],
      consentPhotosPublic: false,
    },
    onSubmit: async ({ value }) => {
      const result = childrenFormSchema.safeParse(value);
      if (!result.success) {
        console.error("Validation failed:", result.error);
        return;
      }

      updateSection("children", result.data);
      navigate({ to: "/family/form/gift-details" });
    },
  });

  useEffect(() => {
    if (form.state.values.children.length > form.state.values.numChildren) {
      const newChildren = form.state.values.children.slice(0, form.state.values.numChildren);
      form.setFieldValue('children', newChildren);
      
      // Clear validation errors for removed children
      // This forces the form to re-validate with only the remaining children
      setTimeout(() => {
        form.validateAllFields('change');
      }, 0);
    }
  }, [form.state.values.numChildren]);

  useEffect(() => {
    if (form.state.values.siblings.length > form.state.values.numSiblings) {
      const newSiblings = form.state.values.siblings.slice(0, form.state.values.numSiblings);
      form.setFieldValue('siblings', newSiblings);
      
      // Clear validation errors for removed siblings
      setTimeout(() => {
        form.validateAllFields('change');
      }, 0);
    }
  }, [form.state.values.numSiblings]);

  return form;
}