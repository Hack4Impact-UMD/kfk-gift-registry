import {
  collectionOptions,
  localStorageCollectionOptions,
  useDbClient,
} from "@tanstack/react-db";
import z from "zod";

export const CartItemSchema = z.object({
  id: z.string(),
  childId: z.string(),
  familyId: z.string(),
  // Optional so carts saved before drive tracking was added remain readable.
  giftDrive: z.string().optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const getCartItemsForDrive = (
  items: Array<CartItem>,
  driveId: string | undefined,
) => (driveId ? items.filter((item) => item.giftDrive === driveId) : []);

// A descriptor rather than a singleton: each DbClient (one per SSR request,
// one in the browser) materializes its own instance. Resolving it through
// DbProvider defers the localStorage read until after hydration, so the
// first client render matches the server's empty cart.
export const cartCollection = collectionOptions(
  localStorageCollectionOptions({
    id: "cart",
    schema: CartItemSchema,
    storageKey: "gift-drive-cart",
    getKey: (item) => item.id,
  }),
);

export function useCartCollection() {
  return useDbClient().collection(cartCollection);
}
