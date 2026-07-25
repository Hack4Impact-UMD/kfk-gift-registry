/* Backend server functions for KFK staff-created gift claims.
 *
 * Staff claims reuse the existing `"kfk"` claim variant (no donorId). These
 * functions mirror the donor lifecycle handlers in `donor.ts`, but they locate
 * the active claim by giftId (not donorId) and are gated to staff roles. Each
 * mutation refuses to touch a `"donor"` claim so donor-owned gifts can only be
 * managed from the donor account.
 */
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import admin from "firebase-admin";
import { DateTime } from "luxon";
import { v7 as uuidv7 } from "uuid";
import type { Address, Claim, Gift } from "common";
import { UserRole } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import { assertGiftDriveActive } from "@/server/services/giftDriveService.server";
import {
  publishNotification,
  createNotificationMessage,
} from "@/server/services/notificationService.server";
import { loadGifts } from "./donor";

const staffRolesMiddleware = requireRolesMiddleware([
  UserRole.DIRECTOR,
  UserRole.ADMIN,
  UserRole.VOLUNTEER,
]);

const giftIdSchema = z.object({
  giftId: z.string().min(1),
});

const updateTrackingNumberSchema = z.object({
  giftId: z.string().min(1),
  trackingNumber: z.string(),
});

const KFK_SPONSOR_NAME = "KFK Team";

const TRACKING_ALLOWED_STATUSES = ["PURCHASED", "DELIVERED", "RECEIVED"];

/**
 * Reads the single active claim for a gift inside a transaction and asserts it
 * is a KFK (staff) claim. Reads must happen before any writes in a Firestore
 * transaction, so call this before issuing updates.
 */
async function getActiveKfkClaim(
  tx: FirebaseFirestore.Transaction,
  db: ReturnType<typeof getServerDB>,
  giftId: string,
): Promise<{
  doc: FirebaseFirestore.QueryDocumentSnapshot<Claim>;
  claim: Claim;
}> {
  const snapshot = await tx.get(
    db.claims.where("giftId", "==", giftId).where("active", "==", true),
  );
  const doc = snapshot.docs[0];
  const claim = doc?.data();

  if (!doc || !claim) {
    throw new Error("Active claim not found for this gift");
  }

  if (claim.claimType !== "kfk") {
    throw new Error(
      "This gift was claimed by a donor and cannot be managed here",
    );
  }

  return { doc, claim };
}

export const claimGiftAsKFK = createServerFn({ method: "POST" })
  .middleware([staffRolesMiddleware])
  .inputValidator(giftIdSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();

    return await db._instance.runTransaction(async (tx) => {
      const { gifts, driveId } = await loadGifts(tx, db, [data.giftId]);
      const gift = gifts[0];

      await assertGiftDriveActive(tx, driveId);

      if (gift.status !== "AVAILABLE") {
        throw new Error(
          `Gift ${gift.id} is not available (status: ${gift.status})`,
        );
      }

      const childSnap = await tx.get(db.children.doc(gift.childId));
      const child = childSnap.data();

      const claimedAt = DateTime.utc().toISO();
      const claim: Claim = {
        id: uuidv7(),
        claimType: "kfk",
        giftId: gift.id,
        childId: gift.childId,
        driveId,
        claimedAt,
        active: true,
      };

      tx.update(db.gifts.doc(gift.id), {
        status: "CLAIMED",
      });

      tx.set(db.claims.doc(claim.id), claim);

      if (child) {
        const message = createNotificationMessage(
          "GIFT_CLAIMED",
          child.name,
          KFK_SPONSOR_NAME,
        );

        await publishNotification(tx, {
          familyId: child.familyId,
          childId: gift.childId,
          type: "GIFT_CLAIMED",
          message,
          giftId: gift.id,
          createdAt: claimedAt,
          driveId,
          read: false,
        });
      }

      return { claim };
    });
  });

export const markKFKGiftPurchased = createServerFn({ method: "POST" })
  .middleware([staffRolesMiddleware])
  .inputValidator(giftIdSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();

    return await db._instance.runTransaction(async (tx) => {
      const giftRef = db.gifts.doc(data.giftId);
      const giftDoc = await tx.get(giftRef);
      const gift = giftDoc.data();

      if (!gift) {
        throw new Error("Gift not found");
      }

      if (
        gift.status === "PURCHASED" ||
        gift.status === "DELIVERED" ||
        gift.status === "RECEIVED"
      ) {
        return gift;
      }

      if (gift.status !== "CLAIMED") {
        throw new Error(
          `Gift cannot be marked purchased (status: ${gift.status})`,
        );
      }

      const { doc: claimDoc, claim } = await getActiveKfkClaim(
        tx,
        db,
        data.giftId,
      );

      tx.update(giftRef, { status: "PURCHASED" });

      if (!claim.purchaseConfirmation?.date) {
        tx.update(claimDoc.ref, {
          "purchaseConfirmation.date": new Date().toISOString(),
        });
      }

      return { ...gift, status: "PURCHASED" as const };
    });
  });

export const markKFKGiftDelivered = createServerFn({ method: "POST" })
  .middleware([staffRolesMiddleware])
  .inputValidator(giftIdSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();

    return await db._instance.runTransaction(async (tx) => {
      const giftRef = db.gifts.doc(data.giftId);
      const giftDoc = await tx.get(giftRef);
      const gift = giftDoc.data();

      if (!gift) {
        throw new Error("Gift not found");
      }

      if (gift.status === "DELIVERED" || gift.status === "RECEIVED") {
        return gift;
      }

      if (gift.status !== "PURCHASED") {
        throw new Error(
          `Gift cannot be marked delivered (status: ${gift.status})`,
        );
      }

      const { doc: claimDoc } = await getActiveKfkClaim(tx, db, data.giftId);

      tx.update(giftRef, { status: "DELIVERED" });
      tx.update(claimDoc.ref, {
        deliveryConfirmed: {
          date: new Date().toISOString(),
          documentationUrl: "",
          verified: false,
        },
      });

      return { ...gift, status: "DELIVERED" as const };
    });
  });

export const updateKFKTrackingNumber = createServerFn({ method: "POST" })
  .middleware([staffRolesMiddleware])
  .inputValidator(updateTrackingNumberSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const trackingNumber = data.trackingNumber.trim();

    return await db._instance.runTransaction(async (tx) => {
      const giftDoc = await tx.get(db.gifts.doc(data.giftId));
      const gift = giftDoc.data();

      if (!gift) {
        throw new Error("Gift not found");
      }

      if (!TRACKING_ALLOWED_STATUSES.includes(gift.status)) {
        throw new Error(
          `Gift cannot accept a tracking number (status: ${gift.status})`,
        );
      }

      const { doc: claimDoc, claim } = await getActiveKfkClaim(
        tx,
        db,
        data.giftId,
      );

      tx.update(claimDoc.ref, {
        purchaseConfirmation: {
          date: claim.purchaseConfirmation?.date ?? new Date().toISOString(),
          documentationUrl: claim.purchaseConfirmation?.documentationUrl ?? "",
          verified: claim.purchaseConfirmation?.verified ?? false,
          ...(trackingNumber ? { trackingNumber } : {}),
        },
      });

      return { giftId: gift.id, trackingNumber };
    });
  });

export const unclaimKFKGift = createServerFn({ method: "POST" })
  .middleware([staffRolesMiddleware])
  .inputValidator(giftIdSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();

    await db._instance.runTransaction(async (tx) => {
      const { gifts, driveId } = await loadGifts(tx, db, [data.giftId]);
      const gift = gifts[0];

      await assertGiftDriveActive(tx, driveId);

      if (gift.status !== "CLAIMED") {
        throw new Error(
          "Only claimed gifts that have not been purchased can be unclaimed.",
        );
      }

      const { doc: claimDoc } = await getActiveKfkClaim(tx, db, data.giftId);

      tx.update(db.gifts.doc(gift.id), {
        status: "AVAILABLE",
        claimedByDonorId: admin.firestore.FieldValue.delete(),
      });
      tx.update(claimDoc.ref, { active: false });
    });
  });

export type StaffGiftClaimDetails = {
  gift: Gift;
  claim: Claim | null;
  child: { id: string; name: string } | null;
  family: {
    contactName: string;
    email: string;
    phone: string;
    address: Address;
  } | null;
  donor: { name: string; phone?: string } | null;
};

export const getStaffGiftClaimDetails = createServerFn({ method: "GET" })
  .middleware([staffRolesMiddleware])
  .inputValidator(giftIdSchema)
  .handler(async ({ data }): Promise<StaffGiftClaimDetails> => {
    const db = getServerDB();

    const giftDoc = await db.gifts.doc(data.giftId).get();
    const gift = giftDoc.data();

    if (!gift) {
      throw new Error("Gift not found");
    }

    const childDoc = await db.children.doc(gift.childId).get();
    const child = childDoc.data();

    const family = child
      ? (await db.families.doc(child.familyId).get()).data()
      : undefined;

    const claimSnapshot = await db.claims
      .where("giftId", "==", gift.id)
      .where("active", "==", true)
      .get();
    const claim = claimSnapshot.docs[0]?.data() ?? null;

    const donorProfile =
      claim?.claimType === "donor"
        ? (await db.users.doc(claim.donorId).get()).data()
        : undefined;

    return {
      gift,
      claim,
      child: child ? { id: gift.childId, name: child.name } : null,
      family: family
        ? {
            contactName: family.contactName,
            email: family.email,
            phone: family.phone,
            address: family.address,
          }
        : null,
      donor:
        claim?.claimType === "donor"
          ? {
              name: donorProfile?.name ?? claim.organizationName ?? "Donor",
              phone: donorProfile?.phone,
            }
          : null,
    };
  });
