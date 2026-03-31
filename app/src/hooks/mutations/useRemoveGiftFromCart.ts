import {useMutation, useQueryClient} from "@tanstack/react-query";
import {cartQueryKey} from "@/hooks/queries/useCartGifts";
import type {CartFamily} from "@/components/storefront/cartMockData";

export function useRemoveGiftFromCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (giftId: string) => {
            return giftId;
        },
        onMutate: async (giftId: string) => {
            await queryClient.cancelQueries({queryKey: cartQueryKey}); // cancelling pending refetches
            const previousData = queryClient.getQueryData<Array<CartFamily>>(cartQueryKey); // current cahce data
            queryClient.setQueryData(cartQueryKey, (oldData: Array<CartFamily> | undefined) => {
                if (!oldData) return oldData;
                return oldData
                    .map((family) => ({
                        ...family,
                        gifts: family.gifts.filter((gift) => gift.id !== giftId),
                    }))
                    .filter((family) => family.gifts.length > 0);
            }); // updating the cache
            
            return {previousData};
        },
        onError: (_err, _giftId, context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(cartQueryKey, context.previousData);
            }
        },
    })
}