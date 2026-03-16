import { useForm } from "@tanstack/react-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import type {
  ChildInfo,
  FamilyFormState,
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
  status: "",
  treatmentLength: "",
  blurb: "",
  isSibling: false,
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
      numChildren: 1,
      children: [defaultChild()],
      additionalNotes: "",
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

  const handleNext = async () => {
    const values = form.state.values;
    const numChildren = Number(values.numChildren);

    const normalizedChildren = values.children.slice(0, numChildren).map((child: any) => {
      const isSibling =
        child.status === "Sibling of child diagnosed with cancer (in or off treatment)" ||
        child.status === "Bereaved sibling";

      const requiresTreatmentLength =
        child.status === "Recently off treatment (within 1 year)" ||
        child.status === "Off treatment (more than 1 year)";

      return {
        ...child,
        isSibling,
        treatmentLength: requiresTreatmentLength ? child.treatmentLength : "N/A",
      };
    });

    const normalized = {
      ...values,
      numChildren,
      children: normalizedChildren,
    };

    const result = childrenFormSchema.safeParse(normalized);
    if (result.success) {
      updateSection("children", result.data as any);
      navigate({
        to: "/family/drive/$driveId/form/gift-details",
        params: { driveId },
      });
    } else {
      await form.validateAllFields("submit");
    }
  };

  return { form, handleNext };
}
