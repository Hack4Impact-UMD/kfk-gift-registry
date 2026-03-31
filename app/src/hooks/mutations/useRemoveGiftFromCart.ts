import {useMutation, useQueryClient} from "@tanstack/react-query";
import {cartQueryKey} from "@/hooks/queries/useCartGifts";

export function useRemoveGiftFromCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (giftId: String) => {
            // just returning the giftId for now, will later make a server call to remove from firestore (when we stop using mock data)
            return giftId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: cartQueryKey});
        }
    })
}