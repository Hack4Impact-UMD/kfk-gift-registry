import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGift } from "@/server/functions/child";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";

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
      toast.error(`Failed to add gift: ${error.message}`);
    },
  });
}
