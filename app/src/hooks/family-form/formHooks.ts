import { createFormHook } from "@tanstack/react-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { fieldContext, formContext } from "./fieldContext";
import { useFormContext } from "@/components/providers/FormProvider";
import type { ChildGiftSelections } from "@/lib/formSchemas";
import {
  childrenFormDefaults,
  childrenFormSchema,
  consentFormDefaults,
  consentSchema,
  defaultChild,
  generalInfoFormDefaults,
  generalInfoSchema,
  isSiblingChildStatus,
} from "@/lib/formSchemas";
import {
  FormAgreement,
  FormBorderedCheckbox,
  FormCheckbox,
  FormFieldInput,
  FormInput,
  FormSelect,
  FormTextarea,
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
    FormTextarea,
  },
  formComponents: {},
});

export function useConsentForm() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();
  const { formLinkId } = useParams({ from: "/family/form/$formLinkId" });

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
        to: `/family/form/$formLinkId/general-info`,
        params: {
          formLinkId: formLinkId,
        },
      });
    },
  });

  return form;
}

export function useGeneralInfoForm() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();
  const { formLinkId } = useParams({ from: "/family/form/$formLinkId" });

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
        to: "/family/form/$formLinkId/children",
        params: {
          formLinkId,
        },
      });
    },
  });

  return form;
}

export function useChildrenForm() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();
  const { formLinkId } = useParams({ from: "/family/form/$formLinkId" });

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
        const isSibling = isSiblingChildStatus(child.status);

        const requiresTreatmentLength =
          child.status === "recently_off_treatment" ||
          child.status === "off_treatment_5yr+";

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
        to: "/family/form/$formLinkId/gift-details",
        params: { formLinkId },
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
