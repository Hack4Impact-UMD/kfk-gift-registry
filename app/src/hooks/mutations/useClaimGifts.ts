import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimGifts, unclaimGifts } from "@/server/functions/donor";
import { queries } from "@/queries";

export function useClaimGifts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftIds: Array<string>) => claimGifts({ data: { giftIds } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
    },
  });
}

export function useUnclaimGifts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftIds: Array<string>) => unclaimGifts({ data: { giftIds } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
    },
  });
}
