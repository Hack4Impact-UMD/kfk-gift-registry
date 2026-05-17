import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGift } from "@/server/functions/child";
import { queries } from "@/queries";
import { getValidationMessage } from "@/lib/serverValidation";
import { toast } from "@/lib/toast";
import type { GiftStatus } from "common";
import {
  GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE,
  GIFT_TITLE_TOO_LONG_MESSAGE,
  MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH,
  MAX_GIFT_TITLE_LENGTH,
} from "common";

function getUpdateGiftErrorMessage(error: Error) {
  const validationMessage = getValidationMessage(error, [
    {
      code: "too_big",
      maximum: MAX_GIFT_TITLE_LENGTH,
      message: GIFT_TITLE_TOO_LONG_MESSAGE,
      path: ["updates", "title"],
    },
    {
      code: "too_big",
      maximum: MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH,
      message: GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE,
      path: ["updates", "familyPublicNotes"],
    },
  ]);

  if (validationMessage) return validationMessage;

  return `Failed to update gift: ${error.message}`;
}

export function useUpdateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      giftId: string;
      updates: {
        title?: string;
        listedPrice?: number;
        status?: GiftStatus;
        familyPublicNotes?: string;
        active?: boolean;
        backup?: boolean;
      };
    }) => updateGift({ data: params }),

    onSuccess: (_data) => {
      const childId = _data.childId;

      queryClient.invalidateQueries({
        queryKey: queries.children.gifts(childId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queries.children.byId(childId).queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queries.children.approvedProfileTableRows._def,
      });

      toast.success("Gift updated successfully");
    },

    onError: (error) => {
      toast.error(getUpdateGiftErrorMessage(error));
    },
  });
}
