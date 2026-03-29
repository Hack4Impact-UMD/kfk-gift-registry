import { useMutation } from "@tanstack/react-query";
import type { FamilyFormState } from "@/components/providers/FormProvider";
import type { GiftsFormData } from "@/lib/formSchemas";
import type { FamilyFormInput } from "@/server/functions/familyForm";
import { submitFamilyForm } from "@/server/functions/familyForm";

export function buildFamilyFormSubmitPayload(
  driveId: string,
  formState: FamilyFormState,
): FamilyFormInput {
  const gi = formState.generalInfo;
  const children = formState.children;
  const gifts = formState.gifts;
  if (!gi || !children || !gifts) {
    throw new Error("Please complete all form sections before submitting.");
  }

  return {
    giftDriveId: driveId,
    generalInfo: {
      parentName: gi.parentName,
      email: gi.email,
      phoneNumber: gi.phoneNumber ?? "",
      privateNotes: "",
      address: {
        street: gi.streetAddress,
        city: gi.city,
        state: gi.state,
        zipCode: gi.zipCode,
        addressLine2: gi.addressLine2?.trim() ?? "",
      },
    },
    children: cleanChildrenObjects(children),
    gifts: cleanGiftsObjects(gifts),
  };
}

function cleanChildrenObjects(
  children: NonNullable<FamilyFormState["children"]>,
): NonNullable<FamilyFormInput["children"]> {
  return {
    ...children,
    additionalNotes: children.additionalNotes?.trim() ?? "",
    children: children.children.map((child) => ({
      ...child,
      diagnosis: child.diagnosis?.trim() ?? "",
      hospitalTreatedAt: child.hospitalTreatedAt?.trim() ?? "",
      socialWorkerName: child.socialWorkerName?.trim() ?? "",
      photoUrl: child.photoUrl ?? "",
      treatmentLength: child.treatmentLength?.trim() ?? "",
      blurb: child.blurb?.trim() ?? "",
    })),
  };
}

function cleanGiftsObjects(
  g: GiftsFormData,
): NonNullable<FamilyFormInput["gifts"]> {
  return {
    giftSelections: g.giftSelections.map((sel) => ({
      childName: sel.childName,
      verified: sel.verified,
      gifts: sel.gifts.map((gift) => ({
        giftName: gift.giftName?.trim() || undefined,
        giftUrl: gift.giftUrl?.trim() || undefined,
      })),
      backupGifts: sel.backupGifts.map((gift) => ({
        giftName: gift.giftName?.trim() || undefined,
        giftUrl: gift.giftUrl?.trim() || undefined,
      })),
    })),
  };
}

export function useSubmitFamilyForm() {
  return useMutation({
    mutationFn: (payload: FamilyFormInput) =>
      submitFamilyForm({ data: payload }),
  });
}
