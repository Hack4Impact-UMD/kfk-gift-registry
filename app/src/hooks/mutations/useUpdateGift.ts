import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGift } from "@/server/functions/child";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";
import type { GiftStatus } from "common";

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
        queryKey: ["approvedProfileTableRows"],
      });

      toast.success("Gift updated successfully");
    },

    onError: (error) => {
      toast.error(`Failed to update gift: ${error.message}`);
    },
  });
}
