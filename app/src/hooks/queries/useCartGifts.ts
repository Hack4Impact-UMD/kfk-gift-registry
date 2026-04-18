import type { CartItem } from "@/local/cartCollection";
import { cartCollection } from "@/local/cartCollection";
import { queries } from "@/queries";
import { useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";

export function useLocalCartData() {
  return useLiveQuery((q) => q.from({ pref: cartCollection }));
}

export function useGroupedCartGifts(gifts: Array<CartItem>) {
  return useQuery(queries.gifts.cart(gifts));
}
