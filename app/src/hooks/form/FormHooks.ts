import { useForm } from "@tanstack/react-form";
import { useFormContext, type FamilyFormState, type ChildInfo, type SiblingInfo } from "@/components/providers/FormProvider";
import { useNavigate } from "@tanstack/react-router";
import { consentSchema, generalInfoSchema, childrenFormSchema } from "@/lib/formSchemas";
import { useEffect } from "react";

const defaultChild = (): ChildInfo => ({
  name: "",
  age: "",
  diagnosis: "",
  hospitalTreatedAt: "",
  socialWorkerName: "",
  photoUrl: "",
});

const defaultSibling = (): SiblingInfo => ({
  name: "",
  age: "",
  photoUrl: "",
});


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
      children: [defaultChild()],
      hasSiblings: false,
      numSiblings: 0,
      siblings: [],
      consentPhotosPublic: false,
    },
  });

  // FormSelect always stores strings. Coerce to number so array-sync comparisons
  // use actual numeric values and so the useEffect dependency triggers correctly.
  useEffect(() => {
    const numChildren = Number(form.state.values.numChildren ?? 1);
    const children = form.state.values.children ?? [];
    if (children.length > numChildren) {
      form.setFieldValue("children", children.slice(0, numChildren));
    } else if (children.length < numChildren) {
      const toAdd = numChildren - children.length;
      form.setFieldValue("children", [...children, ...Array.from({ length: toAdd }, defaultChild)]);
    }
  }, [form.state.values.numChildren]);

  useEffect(() => {
    const numSiblings = Number(form.state.values.numSiblings ?? 0);
    const siblings = form.state.values.siblings ?? [];
    if (siblings.length > numSiblings) {
      form.setFieldValue("siblings", siblings.slice(0, numSiblings));
    } else if (siblings.length < numSiblings) {
      const toAdd = numSiblings - siblings.length;
      form.setFieldValue("siblings", [...siblings, ...Array.from({ length: toAdd }, defaultSibling)]);
    }
  }, [form.state.values.numSiblings]);

  // handleNext bypasses form.handleSubmit() entirely (which gates on canSubmit and
  // can be blocked by stale field errors). We validate directly via Zod on the
  // current live values so stale errors never prevent navigation.
  const handleNext = async () => {
    const values = form.state.values;
    // Normalize: FormSelect stores strings; coerce to numbers before Zod sees them.
    // Also clear siblings when hasSiblings is false so leftover entries don't fail.
    const normalized = {
      ...values,
      numChildren: Number(values.numChildren ?? 1),
      numSiblings: Number(values.numSiblings ?? 0),
      siblings: values.hasSiblings ? values.siblings : [],
    };
    const result = childrenFormSchema.safeParse(normalized);
    if (result.success) {
      updateSection("children", result.data);
      navigate({ to: "/family/form/gift-details" });
    } else {
      // Touch all rendered fields so inline error messages appear
      await form.validateAllFields("submit");
    }
  };

  return { form, handleNext };
}