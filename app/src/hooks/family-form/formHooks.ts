import { createFormHook } from "@tanstack/react-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { fieldContext, formContext } from "./fieldContext";
import { useFormContext } from "@/components/providers/FormProvider";
import {
  ChildGiftSelections,
  childrenFormDefaults,
  childrenFormSchema,
  consentFormDefaults,
  consentSchema,
  defaultChild,
  generalInfoFormDefaults,
  generalInfoSchema,
} from "@/lib/formSchemas";
import {
  FormAgreement,
  FormBorderedCheckbox,
  FormCheckbox,
  FormFieldInput,
  FormInput,
  FormSelect,
} from "@/components/form/FormComponents";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FormInput,
    FormCheckbox,
    FormBorderedCheckbox,
    FormSelect,
    FormFieldInput,
    FormAgreement,
  },
  formComponents: {},
});

export function useConsentForm() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();
  const { driveId } = useParams({ from: "/family/drive/$driveId" });

  const form = useAppForm({
    defaultValues: formState.consentScreen || consentFormDefaults,
    listeners: {
      onChange: ({ formApi }) => {
        updateSection("consentScreen", formApi.state.values);
      },
    },
    validators: {
      onChange: ({ value }) => {
        if (!value.consentGiven) {
          return "You must provide consent to proceed";
        }

        if (!value.shareMailingAddress) {
          return "You must consent to sharing your mailing address to participate in the drive";
        }
      },
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

  const form = useAppForm({
    defaultValues: formState.generalInfo || generalInfoFormDefaults,
    listeners: {
      onChange: ({ formApi }) => {
        updateSection("generalInfo", formApi.state.values);
      },
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

  const form = useAppForm({
    defaultValues: formState.children || childrenFormDefaults,
    listeners: {
      onChange: ({ formApi }) => {
        updateSection("children", formApi.state.values);
      },
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

    const normalizedChildren = values.children
      .slice(0, numChildren)
      .map((child) => {
        const isSibling =
          child.status === "sibling_in_treatment" ||
          child.status === "bereaved_sibling";

        const requiresTreatmentLength =
          child.status === "recently_off_treatment" ||
          child.status === "off_treatment_1yr+";

        return {
          ...child,
          isSibling,
          diagnosis: isSibling ? "" : child.diagnosis,
          hospitalTreatedAt: isSibling ? "" : child.hospitalTreatedAt,
          socialWorkerName: isSibling ? "" : child.socialWorkerName,
          treatmentLength:
            isSibling || !requiresTreatmentLength ? "" : child.treatmentLength,
        };
      });

    const normalized = {
      ...values,
      numChildren,
      children: normalizedChildren,
    };

    const result = childrenFormSchema.safeParse(normalized);
    if (result.success) {
      updateSection("children", result.data);
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

export function useGiftsForm() {
  const { formState, updateSection } = useFormContext();

  const children = formState.children?.children || [];

  const reconciledGiftSelections = children.map((child, index) => {
    const existing = formState.gifts?.giftSelections[index];
    if (existing) {
      return {
        ...existing,
        childName: child.name,
      };
    }
    return {
      childName: child.name,
      gifts: [
        { giftName: "", giftUrl: "" },
        { giftName: "", giftUrl: "" },
        { giftName: "", giftUrl: "" },
      ],
      backupGifts: [
        { giftName: "", giftUrl: "" },
        { giftName: "", giftUrl: "" },
      ],
      verified: false,
    } satisfies ChildGiftSelections;
  });

  const form = useAppForm({
    defaultValues: {
      giftSelections: reconciledGiftSelections,
    },
    listeners: {
      onChange: ({ formApi }) => {
        updateSection("gifts", formApi.state.values);
      },
    },
  });

  return form;
}
