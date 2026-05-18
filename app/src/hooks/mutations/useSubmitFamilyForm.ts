import { useMutation } from "@tanstack/react-query";
import type { FamilyFormState } from "@/components/providers/FormProvider";
import type { GiftsFormData } from "@/lib/formSchemas";
import type { FamilyFormInput } from "@/server/functions/familyForm";
import { submitFamilyForm } from "@/server/functions/familyForm";
import Compressor from "compressorjs";

export async function buildFamilyFormSubmitPayload(
  driveId: string,
  formState: FamilyFormState,
): Promise<FamilyFormInput> {
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
      address: {
        street: gi.streetAddress,
        city: gi.city,
        state: gi.state,
        zipCode: gi.zipCode,
        addressLine2: gi.addressLine2?.trim() ?? "",
      },
    },
    children: await cleanChildrenObjects(children),
    gifts: cleanGiftsObjects(gifts),
  };
}

async function cleanChildrenObjects(
  children: NonNullable<FamilyFormState["children"]>,
): Promise<NonNullable<FamilyFormInput["children"]>> {
  return {
    ...children,
    additionalNotes: children.additionalNotes?.trim() ?? "",
    children: await Promise.all(
      children.children.map(async (child) => ({
        ...child,
        diagnosis: child.diagnosis?.trim() ?? "",
        hospitalTreatedAt: child.hospitalTreatedAt?.trim() ?? "",
        socialWorkerName: child.socialWorkerName?.trim() ?? "",
        photoUrl: (await compressImage(child.photoUrl)) ?? "",
        treatmentLength: child.treatmentLength?.trim() ?? "",
        blurb: child.blurb?.trim() ?? "",
      })),
    ),
  };
}

async function compressImage(dataUrl?: string): Promise<string | null> {
  if (!dataUrl) return null;
  const blob = await (await fetch(dataUrl)).blob();

  return new Promise((resolve, reject) => {
    new Compressor(blob, {
      quality: 0.7,
      success: (file) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve((reader.result as string | undefined) ?? null);
        reader.readAsDataURL(file);
      },
      error: (err) => reject(err),
    });
  });
}

function cleanGiftsObjects(
  g: GiftsFormData,
): NonNullable<FamilyFormInput["gifts"]> {
  return g;
}

export function useSubmitFamilyForm() {
  return useMutation({
    mutationFn: async (payload: FamilyFormInput) =>
      submitFamilyForm({
        data: payload,
      }),
  });
}
