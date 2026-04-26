/* Backend server functions relating to published gifts (per specific giftDrive) */
import { createServerFn } from "@tanstack/react-start";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import type { Claim, GiftStatus, UserProfile } from "common";
import { UserRole } from "common";
import z from "zod";
import { getServerDB } from "@/lib/firebase.server";

const driveIdSchema = z.object({
  // param for both functions
  driveId: z.string(),
});

const GIFT_STATUS_TO_ROW: Record<GiftStatus, string> = {
  AVAILABLE: "unclaimed",
  CLAIMED: "claimed",
  PURCHASED: "purchased",
  DELIVERED: "delivered",
  RECEIVED: "received",
};

function isDonorClaim(
  claim: Claim,
): claim is Extract<Claim, { claimType: "donor" }> {
  return claim.claimType === "donor";
}

export const getPublishedGifts = createServerFn({ method: "GET" })
  .middleware([requireRolesMiddleware([UserRole.DIRECTOR, UserRole.ADMIN])])
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
  .middleware([requireRolesMiddleware([UserRole.DIRECTOR, UserRole.ADMIN])])
  .inputValidator(driveIdSchema)
  .handler(async ({ data }) => {
    const gifts = await getPublishedGifts({ data });
    const db = getServerDB();
    const chunk = <T>(items: Array<T>, size: number): Array<Array<T>> => {
      const chunks: Array<Array<T>> = [];
      for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
      }
      return chunks;
    };

    const giftIds = gifts.map((gift) => gift.id);
    const claimByGiftId = new Map<string, Claim>();

    await Promise.all(
      chunk(giftIds, 30).map(async (giftIdChunk) => {
        const claimsSnapshot = await db.claims
          .where("giftId", "in", giftIdChunk)
          .where("active", "==", true)
          .get();

        for (const claimDoc of claimsSnapshot.docs) {
          const claim = claimDoc.data() as Claim;
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

      let sponsorType: "unpurchased" | "purchased_kfk" | "purchased_donor" =
        "unpurchased";
      let sponsorName: string | undefined;
      let sponsorEmail: string | undefined;

      if (claim?.claimType === "kfk") {
        sponsorType = "purchased_kfk";
        sponsorName = claim.organizationName ?? "KFK Team";
      }

      if (claim?.claimType === "donor") {
        sponsorType = "purchased_donor";
        const donorProfile = profileByDonorId.get(claim.donorId);
        sponsorName = donorProfile?.name;
        sponsorEmail = donorProfile?.email;
      }

      const giftStatus = GIFT_STATUS_TO_ROW[gift.status];

      return {
        id: gift.id,
        giftName: gift.title,
        giftStatus,
        sponsorType,
        sponsorName,
        sponsorEmail,
        dateOfFulfillment:
          claim?.receivedAt ??
          claim?.deliveryConfirmed?.date ??
          claim?.purchaseConfirmation?.date,
        productUrl: gift.productUrl,
      };
    });
  });
