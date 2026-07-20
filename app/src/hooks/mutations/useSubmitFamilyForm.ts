import { useMutation } from "@tanstack/react-query";
import type { FamilyFormState } from "@/components/providers/FormProvider";
import { giftsFormSchema } from "@/lib/formSchemas";
import type { GiftsFormData } from "@/lib/formSchemas";
import type { FamilyFormInput } from "@/server/functions/familyForm";
import {
  submitFamilyForm,
  setChildPhotoUrls,
} from "@/server/functions/familyForm";
import { toast } from "@/lib/toast";
import {
  GIFT_PRICE_INVALID_MESSAGE,
  MAX_GIFT_PRICE,
  isValidAmazonProductUrl,
  normalizeAmazonProductUrl,
} from "common";
import { uploadChildProfilePicture } from "@/services/storageService";

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
  if (!giftsResult.success) {
    throw new Error(
      giftsResult.error.issues[0]?.message ?? "Invalid gift data.",
    );
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
    gifts: cleanGiftsObjects(giftsResult.data),
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
        trimmedGiftUrl !== "" && isValidAmazonProductUrl(trimmedGiftUrl)
          ? normalizeAmazonProductUrl(trimmedGiftUrl)
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

      const uploadResults = await Promise.allSettled(
        photosToUpload.map(async (photo, i) => {
          const id = res.childIds[i];
          if (photo) {
            await uploadChildProfilePicture(id, photo);
            return id;
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

      const uploadedChildIds = uploadResults
        .filter(
          (r): r is PromiseFulfilledResult<string> =>
            r.status === "fulfilled" && r.value !== undefined,
        )
        .map((r) => r.value);

      if (uploadedChildIds.length > 0) {
        await setChildPhotoUrls({
          data: { childIds: uploadedChildIds },
        }).catch(() => {
          toast.error(
            "Your form was submitted, but we couldn't finalize the photo(s). Please contact us to resolve the issue.",
          );
        });
      }

      return res;
    },
  });
}
