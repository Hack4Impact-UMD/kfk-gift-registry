import {
  createCollection,
  localStorageCollectionOptions,
} from "@tanstack/react-db";
import z from "zod";

export const CartItemSchema = z.object({
  id: z.string(),
  childId: z.string(),
  familyId: z.string(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const cartCollection = createCollection(
  localStorageCollectionOptions({
    id: "cart",
    schema: CartItemSchema,
    storageKey: "gift-drive-cart",
    getKey: (item) => item.id,
  }),
);
