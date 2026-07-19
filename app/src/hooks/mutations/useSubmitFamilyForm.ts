import { useMutation } from "@tanstack/react-query";
import type { FamilyFormState } from "@/components/providers/FormProvider";
import { giftsFormSchema } from "@/lib/formSchemas";
import type { GiftsFormData } from "@/lib/formSchemas";
import type { FamilyFormInput } from "@/server/functions/familyForm";
import { submitFamilyForm } from "@/server/functions/familyForm";
import Compressor from "compressorjs";
import { uploadChildPictureAppCheck } from "@/server/functions/child";
import { toast } from "@/lib/toast";
import {
  GIFT_LISTING_URL_WARNING_MESSAGE,
  GIFT_PRICE_INVALID_MESSAGE,
  MAX_GIFT_PRICE,
  isValidGiftListingUrl,
  normalizeGiftListingUrl,
} from "common";

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

  const giftsResult = giftsFormSchema.safeParse(gifts);
  const blockingGiftIssue = !giftsResult.success
    ? giftsResult.error.issues.find(
        (issue) => issue.message !== GIFT_LISTING_URL_WARNING_MESSAGE,
      )
    : null;
  if (blockingGiftIssue) {
    throw new Error(blockingGiftIssue.message);
  }
  const validatedGifts = giftsResult.success ? giftsResult.data : gifts;

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
    gifts: cleanGiftsObjects(validatedGifts),
  };
}

function cleanChildrenObjects(
  children: NonNullable<FamilyFormState["children"]>,
): NonNullable<FamilyFormInput["children"]> {
  const shouldIncludePhotos = children.consentPhotosPublic;

  return {
    ...children,
    additionalNotes: children.additionalNotes?.trim() ?? "",
    children: children.children.map((child) => ({
      ...child,
      diagnosis: child.diagnosis?.trim() ?? "",
      hospitalTreatedAt: child.hospitalTreatedAt?.trim() ?? "",
      socialWorkerName: child.socialWorkerName?.trim() ?? "",
      treatmentLength: child.treatmentLength?.trim() ?? "",
      photoUrl: shouldIncludePhotos ? child.photoUrl : "",
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
  const normalizeListedPrice = (listedPrice: string) => {
    const trimmedPrice = listedPrice.trim();
    if (trimmedPrice === "") return undefined;

    const numericPrice = Number(trimmedPrice);
    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      numericPrice > MAX_GIFT_PRICE
    ) {
      throw new Error(GIFT_PRICE_INVALID_MESSAGE);
    }

    return numericPrice;
  };

  const normalizeGift = (
    gift: GiftsFormData["giftSelections"][number]["gifts"][number],
  ) => {
    const trimmedGiftUrl = gift.giftUrl.trim();

    return {
      ...gift,
      giftName: gift.giftName.trim(),
      giftUrl:
        trimmedGiftUrl !== "" && isValidGiftListingUrl(trimmedGiftUrl)
          ? normalizeGiftListingUrl(trimmedGiftUrl)
          : trimmedGiftUrl,
      listedPrice: normalizeListedPrice(gift.listedPrice),
      familyPublicNotes: gift.familyPublicNotes?.trim() ?? "",
    };
  };

  return {
    giftSelections: g.giftSelections.map((selection) => ({
      ...selection,
      childName: selection.childName.trim(),
      gifts: [
        normalizeGift(selection.gifts[0]),
        normalizeGift(selection.gifts[1]),
        normalizeGift(selection.gifts[2]),
      ],
      backupGifts: [
        normalizeGift(selection.backupGifts[0]),
        normalizeGift(selection.backupGifts[1]),
      ],
    })),
  };
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
      const photosToUpload = payload.children?.consentPhotosPublic
        ? photos
        : [];

      //NOTE: Image data is base64 encoded data URLs. Images are at most 5mb. In order to avoid possible HTTP request body size limits, we need to split up uploads over multiple requests (one per image)
      const uploadResults = await Promise.allSettled(
        photosToUpload.map(async (p, i) => {
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
