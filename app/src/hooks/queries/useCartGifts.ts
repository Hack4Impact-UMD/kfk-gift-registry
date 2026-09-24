import type { CartItem } from "@/local/cartCollection";
import { cartCollection } from "@/local/cartCollection";
import { queries } from "@/queries";
import { useLiveQuery } from "@tanstack/react-db";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useLocalCartData() {
  return useLiveQuery((q) => q.from({ pref: cartCollection }));
}

export function useGroupedCartGifts(
  gifts: Array<CartItem>,
  driveId: string | undefined,
) {
  return useQuery({
    ...queries.gifts.cart(gifts, driveId ?? ""),
    enabled: !!driveId,
    placeholderData: keepPreviousData,
  });
}
