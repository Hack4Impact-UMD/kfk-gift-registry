/* Backend server functions relating to published gifts (per specific giftDrive) */
import { createServerFn } from "@tanstack/react-start";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import { UserRole } from "common";
import z from "zod";
import { getServerDB } from "@/lib/firebase.server";
import { getUserProfileById } from "./profile";

const driveIdSchema = z.object({
  // param for both functions
  driveId: z.string(),
});

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

    return Promise.all(
      gifts.map(async (gift) => {
        const claimsSnapshot = await db.claims
          .where("giftId", "==", gift.id)
          .where("active", "==", true)
          .get();
        const claim = claimsSnapshot.docs[0]?.data();

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
          const donorProfile = await getUserProfileById({
            data: { uid: claim.donorId },
          });
          sponsorName = donorProfile.name;
          sponsorEmail = donorProfile.email;
        }

        const giftStatus =
          gift.status === "AVAILABLE"
            ? "unclaimed"
            : gift.status === "CLAIMED"
              ? "claimed"
              : gift.status === "PURCHASED"
                ? "purchased"
                : "delivered";

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
      }),
    );
  });
