import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGift } from "@/server/functions/child";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";
import type { GiftStatus } from "common";

const GIFT_NOTES_TOO_LONG_ERROR = "Gift notes must be 150 characters or fewer.";

function getUpdateGiftErrorMessage(error: Error) {
  if (
    error.message.includes("familyPublicNotes") &&
    error.message.includes("maximum") &&
    error.message.includes("150")
  ) {
    return GIFT_NOTES_TOO_LONG_ERROR;
  }

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
