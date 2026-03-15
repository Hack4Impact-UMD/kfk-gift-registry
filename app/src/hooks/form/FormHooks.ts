import { useForm } from "@tanstack/react-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import type {
  ChildInfo,
  FamilyFormState,
  SiblingInfo,
} from "@/components/providers/FormProvider";
import { useFormContext } from "@/components/providers/FormProvider";
import {
  childrenFormSchema,
  consentSchema,
  generalInfoSchema,
} from "@/lib/formSchemas";

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

export function useProgressBarNavigation<
  TFormKey extends keyof FamilyFormState,
>(sectionKey: TFormKey, getCurrentValues: () => FamilyFormState[TFormKey]) {
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
  const { driveId } = useParams({ from: "/family/drive/$driveId" });

  const form = useForm({
    defaultValues: formState.consentScreen || {
      consentGiven: false,
      shareMailingAddress: false,
    },
    onSubmit: ({ value }) => {
      const result = consentSchema.safeParse(value);
      if (!result.success) {
        console.error("Validation failed:", result.error);
        return;
      }

      updateSection("consentScreen", result.data);

      navigate({
        to: `/family/drive/$driveId/form/general-info`,
        params: {
          driveId: driveId,
        },
      });
    },
  });

  return form;
}

export function useGeneralInfoForm() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();
  const { driveId } = useParams({ from: "/family/drive/$driveId" });

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
    onSubmit: ({ value }) => {
      const result = generalInfoSchema.safeParse(value);
      if (!result.success) {
        console.error("Validation failed:", result.error);
        return;
      }

      updateSection("generalInfo", result.data);
      navigate({
        to: "/family/drive/$driveId/form/children",
        params: {
          driveId,
        },
      });
    },
  });

  return form;
}

export function useChildrenForm() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();
  const { driveId } = useParams({ from: "/family/drive/$driveId" });

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

  useEffect(() => {
    const numChildren = Number(form.state.values.numChildren);
    const children = form.state.values.children;
    if (children.length > numChildren) {
      form.setFieldValue("children", children.slice(0, numChildren));
    } else if (children.length < numChildren) {
      const toAdd = numChildren - children.length;
      form.setFieldValue("children", [
        ...children,
        ...Array.from({ length: toAdd }, defaultChild),
      ]);
    }
  }, [form, form.state.values.numChildren]);

  useEffect(() => {
    const numSiblings = Number(form.state.values.numSiblings);
    const siblings = form.state.values.siblings;
    if (siblings.length > numSiblings) {
      form.setFieldValue("siblings", siblings.slice(0, numSiblings));
    } else if (siblings.length < numSiblings) {
      const toAdd = numSiblings - siblings.length;
      form.setFieldValue("siblings", [
        ...siblings,
        ...Array.from({ length: toAdd }, defaultSibling),
      ]);
    }
  }, [form, form.state.values.numSiblings]);

  const handleNext = async () => {
    const values = form.state.values;

    // Coerce counts to numbers — FormSelect stores strings ("2", "3", …).
    const numChildren = Number(values.numChildren);
    const numSiblings = Number(values.numSiblings);

    const expectedChildCount = values.hasMultipleChildren ? numChildren : 1;
    const normalizedChildren = values.children.slice(0, expectedChildCount);
    const normalizedSiblings = values.hasSiblings
      ? values.siblings.slice(0, numSiblings)
      : [];

    const normalized = {
      ...values,
      numChildren,
      numSiblings,
      children: normalizedChildren,
      siblings: normalizedSiblings,
    };

    const result = childrenFormSchema.safeParse(normalized);
    if (result.success) {
      updateSection("children", result.data);
      navigate({
        to: "/family/drive/$driveId/form/gift-details",
        params: {
          driveId,
        },
      });
    } else {
      // Touch all rendered fields so inline error messages appear
      await form.validateAllFields("submit");
    }
  };

  return { form, handleNext };
}
