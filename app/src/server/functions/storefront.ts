import { createServerFn } from "@tanstack/react-start";
import { getServerDB } from "@/lib/firebase.server";
import type { Child, Gift, GiftStatus } from "common";
import { compareGiftOrder } from "common";
import z from "zod";
import type { StorefrontGift } from "@/types/storefront";
import { getFirstNameLastInitial } from "@/lib/utils";

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

const giftIdSchema = z.object({
  giftId: z.string().min(1),
});

// Treatment levels are ordered A through D as 0 through 3. Unknown levels
// should follow all known levels in storefront ordering.
const UNKNOWN_TREATMENT_LEVEL_SORT_VALUE = 4;

const getTreatmentLevelSortValue = (treatmentLevel: number | undefined) =>
  treatmentLevel ?? UNKNOWN_TREATMENT_LEVEL_SORT_VALUE;

export const getStorefrontGift = createServerFn({ method: "GET" })
  .inputValidator(giftIdSchema)
  .handler(async ({ data }): Promise<StorefrontGift> => {
    const db = getServerDB();
    const giftDoc = await db.gifts.doc(data.giftId).get();

    const gift = giftDoc.data();

    if (!gift) {
      throw new Error("Gift not found");
    }

    if (!gift.active) {
      throw new Error("Gift not found");
    }

    const childDoc = await db.children.doc(gift.childId).get();
    const child = childDoc.exists ? childDoc.data() : undefined;

    if (!child?.published) {
      throw new Error("Gift not found");
    }

    return {
      id: gift.id,
      title: gift.title,
      productUrl: gift.productUrl,
      listedPrice: gift.listedPrice,
      status: gift.status,
      familyId: gift.familyId,
      childId: gift.childId,
      childName: getFirstNameLastInitial(child.name),
      familyPublicNotes: gift.familyPublicNotes,
      backup: gift.backup,
    } satisfies StorefrontGift;
  });

const claimedGiftStatuses = new Set<GiftStatus>([
  "CLAIMED",
  "PURCHASED",
  "DELIVERED",
  "RECEIVED",
]);

type StorefrontData = {
  profiles: Array<StorefrontChildWithGifts>;
  stats: {
    giftsClaimed: number;
    totalGifts: number;
    childrenWithGifts: number;
    uniqueDonors: number;
  };
};

// Every visitor sees the same storefront, so it is cached per server instance
// for a short window instead of being re-read from Firestore on each visit.
// Slightly stale availability is safe: claiming re-checks gift status in a
// transaction.
const STOREFRONT_CACHE_TTL_MS = 60 * 1000;
const storefrontCache = new Map<
  string,
  { expiresAt: number; data: Promise<StorefrontData> }
>();

function getStorefrontData(driveId: string): Promise<StorefrontData> {
  const cached = storefrontCache.get(driveId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = loadStorefrontData(driveId);
  storefrontCache.set(driveId, {
    expiresAt: Date.now() + STOREFRONT_CACHE_TTL_MS,
    data,
  });
  data.catch(() => {
    if (storefrontCache.get(driveId)?.data === data) {
      storefrontCache.delete(driveId);
    }
  });
  return data;
}

async function loadStorefrontData(driveId: string): Promise<StorefrontData> {
  const db = getServerDB();
  const [giftsSnapshot, childrenSnapshot] = await Promise.all([
    db.gifts
      .where("giftDrive", "==", driveId)
      .where("active", "==", true)
      .get(),
    db.children
      .where("giftDrive", "==", driveId)
      .where("published", "==", true)
      .get(),
  ]);

  const allChildren = childrenSnapshot.docs.map((doc) => doc.data());
  const allGifts = giftsSnapshot.docs.map((doc) => doc.data());
  const publishedChildIds = new Set(allChildren.map((c) => c.id));

  return {
    profiles: buildProfiles(
      allChildren,
      allGifts.filter(
        (gift) => !gift.backup && publishedChildIds.has(gift.childId),
      ),
    ),
    stats: buildStats(allGifts, publishedChildIds),
  };
}

function buildProfiles(
  allChildren: Array<Child>,
  storefrontGifts: Array<Gift>,
): Array<StorefrontChildWithGifts> {
  storefrontGifts.sort(compareGiftOrder);

  const giftsByChildId = new Map<string, Array<Gift>>();
  for (const gift of storefrontGifts) {
    const childGifts = giftsByChildId.get(gift.childId) ?? [];
    childGifts.push(gift);
    giftsByChildId.set(gift.childId, childGifts);
  }

  const familyTreatmentLevels = new Map<string, number>();
  for (const child of allChildren) {
    const childLevel = getTreatmentLevelSortValue(child.treatmentLevel);
    const currentFamilyLevel = familyTreatmentLevels.get(child.familyId);

    familyTreatmentLevels.set(
      child.familyId,
      currentFamilyLevel === undefined
        ? childLevel
        : Math.min(currentFamilyLevel, childLevel),
    );
  }

  const sortedChildren = [...allChildren].sort((a, b) => {
    const aFamilyLevel = familyTreatmentLevels.get(a.familyId) ?? 0;
    const bFamilyLevel = familyTreatmentLevels.get(b.familyId) ?? 0;

    if (aFamilyLevel !== bFamilyLevel) {
      return aFamilyLevel - bFamilyLevel;
    }

    if (a.familyId !== b.familyId) {
      return a.familyId.localeCompare(b.familyId);
    }

    return (
      getTreatmentLevelSortValue(a.treatmentLevel) -
      getTreatmentLevelSortValue(b.treatmentLevel)
    );
  });

  return sortedChildren
    .filter((child) =>
      (giftsByChildId.get(child.id) ?? []).some(
        (gift) => gift.status === "AVAILABLE",
      ),
    )
    .map((child) => {
      const childGifts = giftsByChildId.get(child.id) ?? [];

      const gifts: Array<StorefrontGift> = childGifts.map((gift) => ({
        id: gift.id,
        title: gift.title,
        productUrl: gift.productUrl,
        listedPrice: gift.listedPrice,
        status: gift.status,
        childId: gift.childId,
        childName: getFirstNameLastInitial(child.name),
        familyId: gift.familyId,
        backup: gift.backup,
      }));

      return {
        id: child.id,
        name: getFirstNameLastInitial(child.name),
        status: child.status,
        photoUrl: child.photoUrl,
        category: child.category,
        age: child.age,
        diagnosis: child.category == "warrior" ? child.diagnosis : "",
        publicBlurb: child.publicBlurb,
        published: child.published,
        familyId: child.familyId,
        gifts,
      };
    });
}

// Header stats are computed from every gift in the drive rather than from the
// profiles, which drop children once all of their gifts are claimed.
function buildStats(
  allGifts: Array<Gift>,
  publishedChildIds: Set<string>,
): StorefrontData["stats"] {
  const donorIds = new Set<string>();
  const childrenWithGiftsIds = new Set<string>();
  let totalGifts = 0;
  let giftsClaimed = 0;

  for (const gift of allGifts) {
    if (gift.claimedByDonorId) donorIds.add(gift.claimedByDonorId);
    if (gift.backup || !publishedChildIds.has(gift.childId)) continue;

    totalGifts += 1;
    if (!claimedGiftStatuses.has(gift.status)) continue;

    giftsClaimed += 1;
    childrenWithGiftsIds.add(gift.childId);
  }

  return {
    giftsClaimed,
    totalGifts,
    childrenWithGifts: childrenWithGiftsIds.size,
    uniqueDonors: donorIds.size,
  };
}

export const getProfilesForStorefront = createServerFn({ method: "GET" })
  .inputValidator(driveIdSchema)
  .handler(
    async ({ data }) => (await getStorefrontData(data.driveId)).profiles,
  );

export const getStorefrontStatsForDrive = createServerFn({ method: "GET" })
  .inputValidator(driveIdSchema)
  .handler(async ({ data }) => (await getStorefrontData(data.driveId)).stats);

export type StorefrontStats = Awaited<
  ReturnType<typeof getStorefrontStatsForDrive>
>;

const purchasedGiftStatuses = new Set<GiftStatus>([
  "PURCHASED",
  "DELIVERED",
  "RECEIVED",
]);

// Stats for a completed drive. Reads gifts by drive rather than going through
// getProfilesForStorefront, which hides backups and fully-claimed children.
export const getOffSeasonStatsForDrive = createServerFn({ method: "GET" })
  .inputValidator(driveIdSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const gifts = (
      await db.gifts
        .where("giftDrive", "==", data.driveId)
        .where("active", "==", true)
        .get()
    ).docs.map((d) => d.data());

    const donorIds = new Set<string>();
    const childrenReceivedGiftIds = new Set<string>();
    let totalPurchasedGifts = 0;
    let donationAmount = 0;

    for (const gift of gifts) {
      if (gift.claimedByDonorId) donorIds.add(gift.claimedByDonorId);
      if (!purchasedGiftStatuses.has(gift.status)) continue;

      totalPurchasedGifts += 1;
      donationAmount += gift.listedPrice ?? 0;
      childrenReceivedGiftIds.add(gift.childId);
    }

    return {
      totalPurchasedGifts,
      childrenReceivedGifts: childrenReceivedGiftIds.size,
      donationAmount,
      uniqueDonors: donorIds.size,
    };
  });
