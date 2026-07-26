/* Backend server functions relating to published gifts (per specific giftDrive) */
import { createServerFn } from "@tanstack/react-start";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import type { Claim, UserProfile } from "common";
import { UserRole } from "common";
import z from "zod";
import { getServerDB } from "@/lib/firebase.server";
import type {
  GiftClaimStatus,
  PublishedGiftsTableRow,
} from "@/components/tables/PublishedGiftsTable/types";
import { chunk, isDonorClaim } from "@/lib/utils";
import type { AdminDashboardMetrics } from "@/types/adminDashboard";

const driveIdSchema = z.object({
  // param for both functions
  driveId: z.string(),
});

export const getPublishedGifts = createServerFn({ method: "GET" })
  .middleware([
    requireRolesMiddleware([
      UserRole.DIRECTOR,
      UserRole.ADMIN,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(driveIdSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { driveId } = data;

    const gifts = await db.gifts.where("giftDrive", "==", driveId).get();
    const thisDrivesChildren = await db.children
      .where("giftDrive", "==", driveId)
      .where("published", "==", true)
      .get();

    const childrensIds = new Set(thisDrivesChildren.docs.map((doc) => doc.id));
    const publishedGifts = gifts.docs
      .map((doc) => doc.data())
      .filter((gift) => childrensIds.has(gift.childId));

    return publishedGifts;
  });

export const getPublishedGiftsTableRows = createServerFn({ method: "GET" })
  .middleware([
    requireRolesMiddleware([
      UserRole.DIRECTOR,
      UserRole.ADMIN,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(driveIdSchema)
  .handler(async ({ data }) => {
    const gifts = await getPublishedGifts({ data });
    const db = getServerDB();

    const giftIds = gifts.map((gift) => gift.id);
    const claimByGiftId = new Map<string, Claim>();

    await Promise.all(
      chunk(giftIds, 30).map(async (giftIdChunk) => {
        const claimsSnapshot = await db.claims
          .where("giftId", "in", giftIdChunk)
          .where("active", "==", true)
          .get();

        for (const claimDoc of claimsSnapshot.docs) {
          const claim = claimDoc.data();
          if (!claimByGiftId.has(claim.giftId)) {
            claimByGiftId.set(claim.giftId, claim);
          }
        }
      }),
    );

    const donorIds = Array.from(
      new Set(
        Array.from(claimByGiftId.values())
          .filter(isDonorClaim)
          .map((claim) => claim.donorId),
      ),
    );

    const profileByDonorId = new Map<string, UserProfile>();
    await Promise.all(
      chunk(donorIds, 300).map(async (donorIdChunk) => {
        const donorRefs = donorIdChunk.map((donorId) => db.users.doc(donorId));
        const donorSnapshots = await db._instance.getAll(...donorRefs);
        for (const donorSnapshot of donorSnapshots) {
          if (donorSnapshot.exists) {
            profileByDonorId.set(
              donorSnapshot.id,
              donorSnapshot.data() as UserProfile,
            );
          }
        }
      }),
    );

    return gifts.map((gift) => {
      const claim = claimByGiftId.get(gift.id);

      let sponsorType: GiftClaimStatus = "unclaimed";
      let sponsorName: string | undefined;
      let sponsorEmail: string | undefined;

      if (claim?.claimType === "kfk") {
        sponsorType = "claimed_kfk";
        sponsorName = claim.organizationName ?? "KFK Team";
      }

      if (claim?.claimType === "donor") {
        sponsorType = "claimed_donor";
        const donorProfile = profileByDonorId.get(claim.donorId);
        sponsorName = donorProfile?.name;
        sponsorEmail = donorProfile?.email;
      }

      return {
        id: gift.id,
        giftName: gift.title,
        giftStatus: gift.status,
        sponsorType,
        sponsorName,
        sponsorEmail,
        dateOfFulfillment:
          claim?.receivedAt ??
          claim?.deliveryConfirmed?.date ??
          claim?.purchaseConfirmation?.date,
        productUrl: gift.productUrl,
      } satisfies PublishedGiftsTableRow;
    });
  });

export const getAdminDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([
    requireRolesMiddleware([
      UserRole.DIRECTOR,
      UserRole.ADMIN,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(driveIdSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { driveId } = data;

    const [publishedGifts, familiesSnapshot, childrenSnapshot] = await Promise.all([
      getPublishedGifts({ data }),
      db.families.where("giftDrive", "==", driveId).get(),
      db.children.where("giftDrive", "==", driveId).get(),
    ]);

    const giftIds = publishedGifts.map((gift) => gift.id);
    const claimByGiftId = new Map<string, Claim>();

    await Promise.all(
      chunk(giftIds, 30).map(async (giftIdChunk) => {
        if (giftIdChunk.length === 0) {
          return;
        }

        const claimsSnapshot = await db.claims
          .where("giftId", "in", giftIdChunk)
          .where("active", "==", true)
          .get();

        for (const claimDoc of claimsSnapshot.docs) {
          const claim = claimDoc.data();
          if (!claimByGiftId.has(claim.giftId)) {
            claimByGiftId.set(claim.giftId, claim);
          }
        }
      }),
    );

    const giftBreakdown = {
      unpurchased: 0,
      purchasedByDonors: 0,
      purchasedByAdmins: 0,
    };

    const statusBreakdown = {
      unclaimed: 0,
      unordered: 0,
      inTransit: 0,
      delivered: 0,
      received: 0,
    };

    let donationAmount = 0;
    const uniqueDonorIds = new Set<string>();

    for (const gift of publishedGifts) {
      const claim = claimByGiftId.get(gift.id);
      const isPurchased = ["PURCHASED", "DELIVERED", "RECEIVED"].includes(
        gift.status,
      );

      if (gift.status === "AVAILABLE") {
        statusBreakdown.unclaimed += 1;
      } else if (gift.status === "CLAIMED") {
        statusBreakdown.unordered += 1;
      } else if (gift.status === "PURCHASED") {
        statusBreakdown.inTransit += 1;
      } else if (gift.status === "DELIVERED") {
        statusBreakdown.delivered += 1;
      } else if (gift.status === "RECEIVED") {
        statusBreakdown.received += 1;
      }

      if (gift.status === "AVAILABLE" || gift.status === "CLAIMED") {
        giftBreakdown.unpurchased += 1;
      }

      if (isPurchased) {
        donationAmount += gift.listedPrice ?? 0;

        if (claim?.claimType === "donor") {
          giftBreakdown.purchasedByDonors += 1;
          uniqueDonorIds.add(claim.donorId);
        } else if (claim?.claimType === "kfk") {
          giftBreakdown.purchasedByAdmins += 1;
        }
      }
    }

    const families = familiesSnapshot.docs.map((doc) => doc.data());
    const familyProfiles = {
      approved: 0,
      pending: 0,
      holdfile: 0,
    };

    for (const family of families) {
      if (family.reviewStatus?.approved) {
        familyProfiles.approved += 1;
      } else if (family.reviewStatus?.held) {
        familyProfiles.holdfile += 1;
      } else {
        familyProfiles.pending += 1;
      }
    }

    const children = childrenSnapshot.docs.map((doc) => doc.data());
    const publishedChildren = children.filter((child) => child.published).length;
    const totalChildren = children.length;

    return {
      driveId,
      lastUpdatedAt: new Date().toISOString(),
      gifts: {
        total: publishedGifts.length,
        breakdown: giftBreakdown,
        statusBreakdown,
      },
      familyProfiles: {
        total: families.length,
        breakdown: familyProfiles,
      },
      approvedChildProfiles: {
        total: totalChildren,
        published: publishedChildren,
        unpublished: totalChildren - publishedChildren,
        publishedPercentage:
          totalChildren === 0
            ? 0
            : Math.round((publishedChildren / totalChildren) * 100),
      },
      donationAmount,
      peopleDonated: uniqueDonorIds.size,
    } satisfies AdminDashboardMetrics;
  });
