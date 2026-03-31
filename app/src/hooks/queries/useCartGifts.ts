import {useQuery} from "@tanstack/react-query";
import {mockCartData} from "@/components/storefront/cartMockData";

export const cartQueryKey = ["cart", "gifts"] as const;

// created this to check if data exists in the cache
export function useCartGifts() {
    return useQuery({
        queryKey: cartQueryKey,
        queryFn: async () => mockCartData
    })
};