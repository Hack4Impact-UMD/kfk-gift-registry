import { createServerFn } from "@tanstack/react-start";
import { DateTime } from "luxon";
import { getServerDB } from "@/lib/firebase.server";
import type { Child, Gift } from "common";
import z from "zod";

type StorefrontGift = Pick<
  Gift,
  "id" | "title" | "productUrl" | "listedPrice" | "status"
>;

export type StorefrontChildWithGifts = Pick<
  Child,
  | "id"
  | "name"
  | "status"
  | "photoUrl"
  | "category"
  | "age"
  | "diagnosis"
  | "publicBlurb"
  | "published"
  | "familyId"
> & {
  gifts: Array<StorefrontGift>;
};

const driveIdSchema = z.object({
  driveId: z.string().min(1),
});

export const getProfilesForStorefront = createServerFn({ method: "GET" })
  .inputValidator(driveIdSchema)
  .handler(async ({ data }) => {
    const { driveId } = data;
    const db = getServerDB();

    // NOTE: Removed .where("published", "==", true) for development with seed data
    // Add it back for production if you want to filter by published status
    const childrenSnapshot = await db.children
      .where("giftDrive", "==", driveId)
      .get();

    if (childrenSnapshot.empty) {
      return [];
    }

    const allChildren = childrenSnapshot.docs.map((doc) => doc.data());
    const childIds = allChildren.map((c) => c.id);

    const allGifts: Array<Gift> = [];
    for (let i = 0; i < childIds.length; i += 10) {
      const batch = childIds.slice(i, i + 10);
      const giftsQuery = await db.gifts
        .where("childId", "in", batch)
        .where("active", "==", true)
        .get();
      allGifts.push(...giftsQuery.docs.map((doc) => doc.data()));
    }

    const giftsByChildId = new Map<string, Array<Gift>>();
    for (const gift of allGifts) {
      if (!giftsByChildId.has(gift.childId)) {
        giftsByChildId.set(gift.childId, []);
      }
      giftsByChildId.get(gift.childId)!.push(gift);
    }

    const familyTreatmentLevels = new Map<string, number>();
    for (const child of allChildren) {
      const currentSum = familyTreatmentLevels.get(child.familyId) ?? 0;
      familyTreatmentLevels.set(
        child.familyId,
        currentSum + (child.treatmentLevel ?? 0),
      );
    }

    const sortedChildren = allChildren.sort((a, b) => {
      const aFamilyLevel = familyTreatmentLevels.get(a.familyId) ?? 0;
      const bFamilyLevel = familyTreatmentLevels.get(b.familyId) ?? 0;

      if (aFamilyLevel !== bFamilyLevel) {
        return aFamilyLevel - bFamilyLevel;
      }

      if (a.familyId !== b.familyId) {
        return a.familyId.localeCompare(b.familyId);
      }

      return (a.treatmentLevel ?? 0) - (b.treatmentLevel ?? 0);
    });

    const results: Array<StorefrontChildWithGifts> = sortedChildren.map(
      (child) => {
        const childGifts = giftsByChildId.get(child.id) ?? [];

        const gifts: Array<StorefrontGift> = childGifts.map((gift) => ({
          id: gift.id,
          title: gift.title,
          productUrl: gift.productUrl,
          listedPrice: gift.listedPrice,
          status: gift.status,
        }));

        return {
          id: child.id,
          name: child.name,
          status: child.status,
          photoUrl: child.photoUrl,
          category: child.category,
          age: child.age,
          diagnosis: child.diagnosis,
          publicBlurb: child.publicBlurb,
          published: child.published,
          familyId: child.familyId,
          gifts,
        };
      },
    );

    return results;
  });

export const getActiveDrive = createServerFn({ method: "GET" }).handler(
  async () => {
    const now = DateTime.utc();
    const db = getServerDB();

    const active = (
      await db.giftDrives
        .where("startDate", "<=", now.toISO())
        .where("endDate", ">=", now.toISO())
        .limit(1)
        .get()
    ).docs[0];

    if (active && active.exists) {
      return active.data();
    } else {
      return undefined;
    }
  },
);
