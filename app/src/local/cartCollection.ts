import {
  createCollection,
  localStorageCollectionOptions,
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

export const cartCollection = createCollection(
  localStorageCollectionOptions({
    id: "cart",
    schema: CartItemSchema,
    storageKey: "gift-drive-cart",
    getKey: (item) => item.id,
  }),
);
