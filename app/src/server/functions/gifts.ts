/* Backend server functions relating to published gifts (per specific giftDrive) */
import { createServerFn } from "@tanstack/react-start";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import type { Child, Claim, Family, UserProfile } from "common";
import { UserRole } from "common";
import z from "zod";
import { getServerDB } from "@/lib/firebase.server";
import type {
  GiftClaimStatus,
  PublishedGiftsTableRow,
} from "@/components/tables/PublishedGiftsTable/types";
import { chunk, isDonorClaim } from "@/lib/utils";

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

    const childIds = Array.from(new Set(gifts.map((gift) => gift.childId)));
    const childById = new Map<string, Child>();
    await Promise.all(
      chunk(childIds, 300).map(async (childIdChunk) => {
        const childRefs = childIdChunk.map((childId) =>
          db.children.doc(childId),
        );
        const childSnapshots = await db._instance.getAll(...childRefs);
        for (const childSnapshot of childSnapshots) {
          if (childSnapshot.exists) {
            childById.set(childSnapshot.id, childSnapshot.data() as Child);
          }
        }
      }),
    );

    const familyIds = Array.from(new Set(gifts.map((gift) => gift.familyId)));
    const familyById = new Map<string, Family>();
    await Promise.all(
      chunk(familyIds, 300).map(async (familyIdChunk) => {
        const familyRefs = familyIdChunk.map((familyId) =>
          db.families.doc(familyId),
        );
        const familySnapshots = await db._instance.getAll(...familyRefs);
        for (const familySnapshot of familySnapshots) {
          if (familySnapshot.exists) {
            familyById.set(familySnapshot.id, familySnapshot.data() as Family);
          }
        }
      }),
    );

    return gifts.map((gift) => {
      const claim = claimByGiftId.get(gift.id);

      let sponsorType: GiftClaimStatus = "unclaimed";
      let sponsorEmail: string | undefined;

      if (claim?.claimType === "kfk") {
        sponsorType = "claimed_kfk";
      }

      if (claim?.claimType === "donor") {
        sponsorType = "claimed_donor";
        const donorProfile = profileByDonorId.get(claim.donorId);
        sponsorEmail = donorProfile?.email;
      }

      const family = familyById.get(gift.familyId);

      return {
        id: gift.id,
        giftName: gift.title,
        giftStatus: gift.status,
        sponsorType,
        sponsorEmail,
        childName: childById.get(gift.childId)?.name,
        parentName: family?.contactName,
        parentEmail: family?.email,
        dateOfFulfillment:
          claim?.receivedAt ??
          claim?.deliveryConfirmed?.date ??
          claim?.purchaseConfirmation?.date,
        productUrl: gift.productUrl,
      } satisfies PublishedGiftsTableRow;
    });
  });
