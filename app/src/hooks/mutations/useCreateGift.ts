import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGift } from "@/server/functions/child";
import { queries } from "@/queries";
import { getValidationMessage } from "@/lib/serverValidation";
import { toast } from "@/lib/toast";
import { GIFT_TITLE_TOO_LONG_MESSAGE, MAX_GIFT_TITLE_LENGTH } from "common";

function getCreateGiftErrorMessage(error: Error) {
  const validationMessage = getValidationMessage(error, [
    {
      code: "too_big",
      maximum: MAX_GIFT_TITLE_LENGTH,
      message: GIFT_TITLE_TOO_LONG_MESSAGE,
      path: ["title"],
    },
  ]);

  if (validationMessage) return validationMessage;

  return `Failed to add gift: ${error.message}`;
}

export function useCreateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      childId: string;
      title: string;
      productUrl: string;
      listedPrice?: number;
      familyPublicNotes?: string;
      active?: boolean;
    }) => createGift({ data: params }),

    onSuccess: async (gift) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queries.children.gifts(gift.childId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: queries.children.approvedProfileTableRows._def,
        }),
        queryClient.invalidateQueries({
          queryKey: queries.storefront._def,
        }),
      ]);

      toast.success("Gift added successfully");
    },

    onError: (error) => {
      toast.error(getCreateGiftErrorMessage(error));
    },
  });
}
