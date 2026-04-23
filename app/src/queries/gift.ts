import type { CartItem } from "@/local/cartCollection";
import { getCartGiftsGroupedByFamily } from "@/server/functions/cart";
import { createQueryKeys } from "@lukemorales/query-key-factory";

export const giftQueries = createQueryKeys("gifts", {
  cart: (items: Array<CartItem>) => ({
    queryKey: ["cart", ...items.map((item) => item.id)],
    queryFn: () => getCartGiftsGroupedByFamily({ data: { items } }),
  }),
});
