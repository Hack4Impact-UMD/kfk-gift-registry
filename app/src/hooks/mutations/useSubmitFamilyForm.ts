import { useMutation } from "@tanstack/react-query";
import type { FamilyFormState } from "@/components/providers/FormProvider";
import type { GiftsFormData } from "@/lib/formSchemas";
import type { FamilyFormInput } from "@/server/functions/familyForm";
import { submitFamilyForm } from "@/server/functions/familyForm";
import Compressor from "compressorjs";
import { uploadChildPictureAppCheck } from "@/server/functions/child";
import { toast } from "@/lib/toast";

export function buildFamilyFormSubmitPayload(
  formLinkId: string,
  formState: FamilyFormState,
): FamilyFormInput {
  const gi = formState.generalInfo;
  const children = formState.children;
  const gifts = formState.gifts;
  if (!gi || !children || !gifts) {
    throw new Error("Please complete all form sections before submitting.");
  }

  return {
    formLinkId,
    generalInfo: {
      parentName: gi.parentName,
      email: gi.email.trim().toLowerCase(),
      phoneNumber: gi.phoneNumber ?? "",
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
      treatmentLength: child.treatmentLength?.trim() ?? "",
      blurb: child.blurb?.trim() ?? "",
    })),
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
    mutationFn: async ({
      payload,
      photos,
    }: {
      payload: FamilyFormInput;
      photos: Array<string | undefined>;
    }) => {
      const res = await submitFamilyForm({
        data: payload,
      });
      //NOTE: Image data is base64 encoded data URLs. Images are at most 5mb. In order to avoid possible HTTP request body size limits, we need to split up uploads over multiple requests (one per image)
      const uploadResults = await Promise.allSettled(
        photos.map(async (p, i) => {
          const id = res.childIds[i];
          const compressedImage = await compressImage(p);

          if (id && compressedImage) {
            await uploadChildPictureAppCheck({
              data: {
                childId: id,
                dataUrl: compressedImage,
              },
            });
          }
        }),
      );

      const failedUploads = uploadResults.filter(
        (r) => r.status === "rejected",
      );
      if (failedUploads.length > 0) {
        toast.error(
          `Your form was submitted, but ${failedUploads.length} photo(s) failed to upload. Please contact us to resolve the issue.`,
        );
      }

      return res;
    },
  });
}
