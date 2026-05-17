import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { Family } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { CartItemSchema } from "@/local/cartCollection";
import type { StorefrontGift } from "@/types/storefront";

export type StorefrontFamily = Pick<Family, "id" | "contactName">;

export type CartFamilyGroup = {
  family: StorefrontFamily;
  gifts: Array<StorefrontGift>;
};

const cartInputSchema = z.object({
  items: z.array(CartItemSchema),
});

export const getCartGiftsGroupedByFamily = createServerFn({ method: "GET" })
  .inputValidator(cartInputSchema)
  .handler(async ({ data }): Promise<Record<string, CartFamilyGroup>> => {
    const { items } = data;
    if (items.length === 0) {
      return {};
    }

    const db = getServerDB();

    const giftIds = Array.from(new Set(items.map((item) => item.id)));
    const giftDocs = await Promise.all(
      giftIds.map((id) => db.gifts.doc(id).get()),
    );

    const gifts = giftDocs.flatMap((doc) => {
      const gift = doc.data();
      if (!gift?.active) return [];
      return [
        {
          id: gift.id,
          title: gift.title,
          productUrl: gift.productUrl,
          listedPrice: gift.listedPrice,
          status: gift.status,
          childId: gift.childId,
          familyId: gift.familyId,
          familyPublicNotes: gift.familyPublicNotes,
        } satisfies StorefrontGift,
      ];
    });

    const familyIds = Array.from(new Set(gifts.map((g) => g.familyId)));
    const familyDocs = await Promise.all(
      familyIds.map((id) => db.families.doc(id).get()),
    );

    const familyById: Record<string, StorefrontFamily> = {};
    for (const doc of familyDocs) {
      const family = doc.data();
      if (!family) continue;
      familyById[family.id] = {
        id: family.id,
        contactName: family.contactName,
      };
    }

    const result: Record<string, CartFamilyGroup> = {};
    for (const gift of gifts) {
      const family = familyById[gift.familyId];
      if (!family) continue;

      const group = result[gift.familyId] ?? { family, gifts: [] };
      group.gifts.push(gift);
      result[gift.familyId] = group;
    }

    return result;
  });
