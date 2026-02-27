import { useForm } from "@tanstack/react-form";
import { useFormContext } from "@/components/providers/FormProvider";
import { useNavigate } from "@tanstack/react-router";
import { consentSchema, generalInfoSchema, childrenFormSchema } from "@/lib/formSchemas";

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
      streetAddress: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
    },
    onSubmit: async ({ value }) => {
      const result = generalInfoSchema.safeParse(value);
      if (!result.success) {
        const firstError = result.error.issues[0];
        alert(`${firstError.path.join(".")}: ${firstError.message}`);
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
      children: [],
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
      navigate({ to: "/family/form/gifts" });
    },
  });

  return form;
}