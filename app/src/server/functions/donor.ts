import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import admin from "firebase-admin";
import { DateTime } from "luxon";
import { v7 as uuidv7 } from "uuid";
import type { Child, Claim, Gift } from "common";
import { UserRole } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import { assertGiftDriveActive } from "@/server/services/giftDriveService.server";
import { buildDonorPostClaimConfirmationPayload } from "@/server/services/donorEmailPayloadService.server";
import { renderDonorPostClaimConfirmationEmail } from "@/server/services/donorEmailRenderer.server";
import { sendEmailNow } from "@/server/services/emailService.server";
import type { CommittedChild } from "@/components/donor/home/types";
import {
  publishNotification,
  createNotificationMessage,
} from "@/server/services/notificationService.server";

const giftIdsSchema = z.object({
  giftIds: z.array(z.string().min(1)).min(1),
});

const giftIdSchema = z.object({
  giftId: z.string().min(1),
});

const updateTrackingNumberSchema = z.object({
  giftId: z.string().min(1),
  trackingNumber: z.string(),
});

const purchaseReceiptUploadSchema = z.object({
  giftId: z.string().min(1),
  documentationPath: z.string().min(1),
  trackingNumber: z.string().optional(),
});

const deliveryReceiptUploadSchema = z.object({
  giftId: z.string().min(1),
  documentationPath: z.string().min(1),
});

async function loadGifts(
  tx: FirebaseFirestore.Transaction,
  db: ReturnType<typeof getServerDB>,
  giftIds: Array<string>,
): Promise<{ gifts: Array<Gift>; driveId: string }> {
  const giftRefs = giftIds.map((id) => db.gifts.doc(id));
  const giftSnaps = await tx.getAll(...giftRefs);

  const gifts: Array<Gift> = [];
  for (const snap of giftSnaps) {
    if (!snap.exists) {
      throw new Error(`Gift ${snap.id} not found`);
    }
    gifts.push(snap.data() as Gift);
  }

  const driveId = gifts[0].giftDrive;
  if (!gifts.every((g) => g.giftDrive === driveId)) {
    throw new Error("All gifts must belong to the same gift drive");
  }

  return { gifts, driveId };
}

function splitChildName(name: string) {
  const trimmedName = name.trim();
  const [firstName = "", ...lastNameParts] = trimmedName.split(/\s+/);

  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
}

function toCommittedCategory(
  category: Child["category"],
): CommittedChild["category"] {
  return category === "warrior" ? "Warrior" : "Supersib";
}

function getUploadedFileName(urlOrPath?: string) {
  if (!urlOrPath) return null;

  try {
    const lastSegment = urlOrPath.startsWith("https://")
      ? new URL(urlOrPath).pathname.split("/").pop()
      : urlOrPath.split("/").pop();
    if (!lastSegment) return "Receipt uploaded";
    const decoded = decodeURIComponent(lastSegment);
    return decoded.replace(/^\d+-/, "");
  } catch {
    return "Receipt uploaded";
  }
}
const GetCommittedChildrenForDonorRequestSchema = z.object({
  driveId: z.string(),
});

export const getCommittedChildrenForDonor = createServerFn({ method: "GET" })
  .inputValidator(GetCommittedChildrenForDonorRequestSchema)
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .handler(async ({ context, data }) => {
    const donorId = context.authUser.uid;
    const db = getServerDB();

    const claimsSnapshot = await db.claims
      .where("donorId", "==", donorId)
      .where("active", "==", true)
      .where("driveId", "==", data.driveId)
      .get();

    if (claimsSnapshot.empty) {
      return [] satisfies Array<CommittedChild>;
    }

    const claims = claimsSnapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => a.claimedAt.localeCompare(b.claimedAt));

    const giftIds = Array.from(new Set(claims.map((claim) => claim.giftId)));
    const giftRefs = giftIds.map((giftId) => db.gifts.doc(giftId));
    const giftSnapshots = await db._instance.getAll(...giftRefs);

    const giftById = new Map<string, Gift>();
    for (const giftSnapshot of giftSnapshots) {
      if (giftSnapshot.exists) {
        giftById.set(giftSnapshot.id, giftSnapshot.data() as Gift);
      }
    }

    const childIds = Array.from(
      new Set(
        claims
          .map((claim) => giftById.get(claim.giftId)?.childId ?? claim.childId)
          .filter((childId): childId is string => childId.length > 0),
      ),
    );

    const childRefs = childIds.map((childId) => db.children.doc(childId));
    const childSnapshots = await db._instance.getAll(...childRefs);

    const childById = new Map<string, Child>();
    for (const childSnapshot of childSnapshots) {
      if (childSnapshot.exists) {
        childById.set(childSnapshot.id, childSnapshot.data() as Child);
      }
    }

    const committedChildrenById = new Map<string, CommittedChild>();
    for (const claim of claims) {
      const gift = giftById.get(claim.giftId);
      const child = childById.get(gift?.childId ?? claim.childId);

      if (!gift || !child) {
        continue;
      }

      if (!committedChildrenById.has(child.id)) {
        const { firstName, lastName } = splitChildName(child.name);

        committedChildrenById.set(child.id, {
          id: child.id,
          firstName,
          lastName,
          photoUrl: child.photoUrl ?? "",
          category: toCommittedCategory(child.category),
          gifts: [],
        });
      }

      committedChildrenById.get(child.id)?.gifts.push({
        id: gift.id,
        title: gift.title,
        productUrl: gift.productUrl,
        listedPrice: gift.listedPrice ?? 0,
        additionalInfo: gift.familyPublicNotes ?? "",
        status: gift.status,
        purchaseReceiptFileName: getUploadedFileName(
          claim.purchaseConfirmation?.documentationUrl,
        ),
        purchaseReceiptPath:
          claim.purchaseConfirmation?.documentationUrl ?? null,
        deliveryReceiptFileName: getUploadedFileName(
          claim.deliveryConfirmed?.documentationUrl,
        ),
        deliveryReceiptPath: claim.deliveryConfirmed?.documentationUrl ?? null,
        trackingNumber: claim.purchaseConfirmation?.trackingNumber ?? "",
        thankYouNote: claim.thankYouNote ?? null,
      });
    }

    return Array.from(committedChildrenById.values())
      .map((child) => ({
        ...child,
        gifts: [...child.gifts].sort((a, b) => a.title.localeCompare(b.title)),
      }))
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
  });

export const claimGifts = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .inputValidator(giftIdsSchema)
  .handler(async ({ data, context }) => {
    const donorId = context.authUser.uid;
    const giftIds = Array.from(new Set(data.giftIds));
    const db = getServerDB();

    const result = await db._instance.runTransaction(async (tx) => {
      const { gifts, driveId } = await loadGifts(tx, db, giftIds);

      await assertGiftDriveActive(tx, driveId);

      for (const gift of gifts) {
        if (gift.status !== "AVAILABLE") {
          throw new Error(
            `Gift ${gift.id} is not available (status: ${gift.status})`,
          );
        }
      }

      const donorSnap = await tx.get(db.users.doc(donorId));
      const donor = donorSnap.data();
      const donorName = donor?.name ?? "Unknown Donor";

      const childSnapshots = new Map<string, Child>();
      for (const gift of gifts) {
        const childSnap = await tx.get(db.children.doc(gift.childId));
        const child = childSnap.data();
        if (child) {
          childSnapshots.set(gift.childId, child);
        }
      }

      const claimedAt = DateTime.utc().toISO();
      if (!claimedAt) {
        throw new Error("Failed to create claim timestamp");
      }

      const claims: Array<Claim> = gifts.map((gift) => ({
        id: uuidv7(),
        giftId: gift.id,
        childId: gift.childId,
        claimType: "donor",
        donorId,
        driveId,
        claimedAt,
        active: true,
      }));

      for (const gift of gifts) {
        tx.update(db.gifts.doc(gift.id), {
          claimedByDonorId: donorId,
          status: "CLAIMED",
        });
      }

      for (const claim of claims) {
        tx.set(db.claims.doc(claim.id), claim);
      }

      for (const gift of gifts) {
        const child = childSnapshots.get(gift.childId);
        if (!child) continue;

        const message = createNotificationMessage(
          "GIFT_CLAIMED",
          child.name,
          donorName,
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

      return { claims };
    });

    const donorSnapshot = await db.users.doc(donorId).get();
    const donor = donorSnapshot.data();

    if (!donor) {
      console.warn(
        "Skipping donor post-claim confirmation email: donor profile not found",
      );
      return result;
    }

    try {
      const payload = await buildDonorPostClaimConfirmationPayload({
        donor,
        claims: result.claims,
      });

      const { subject, html } =
        await renderDonorPostClaimConfirmationEmail(payload);

      await sendEmailNow({
        to: donor.email,
        subject,
        html,
      });
    } catch (error) {
      console.error(
        "Failed to send donor post-claim confirmation email",
        error,
      );
    }

    return result;
  });

export const markGiftPurchased = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .inputValidator(giftIdSchema)
  .handler(async ({ data, context }) => {
    const donorId = context.authUser.uid;
    const db = getServerDB();
    return await db._instance.runTransaction(async (transaction) => {
      const giftRef = db.gifts.doc(data.giftId);
      const giftDoc = await transaction.get(giftRef);
      const gift = giftDoc.data();

      if (!gift) {
        throw new Error("Gift not found");
      }

      if (gift.claimedByDonorId !== donorId) {
        throw new Error("Gift is not claimed by this donor");
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

      const claimQuery = db.claims
        .where("giftId", "==", data.giftId)
        .where("donorId", "==", donorId)
        .where("active", "==", true);
      const claimSnapshot = await transaction.get(claimQuery);
      const claimDoc = claimSnapshot.docs[0];

      transaction.update(giftRef, {
        status: "PURCHASED",
      });

      if (claimDoc && !claimDoc.data()?.purchaseConfirmation?.date) {
        transaction.update(claimDoc.ref, {
          "purchaseConfirmation.date": new Date().toISOString(),
        });
      }

      return {
        ...gift,
        status: "PURCHASED" as const,
      };
    });
  });

export const uploadPurchaseReceipt = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .inputValidator(purchaseReceiptUploadSchema)
  .handler(async ({ data, context }) => {
    const donorId = context.authUser.uid;
    const db = getServerDB();
    const giftDoc = await db.gifts.doc(data.giftId).get();
    const gift = giftDoc.data();

    if (!gift) {
      throw new Error("Gift not found");
    }

    if (gift.claimedByDonorId !== donorId) {
      throw new Error("Gift is not claimed by this donor");
    }

    if (!["PURCHASED", "DELIVERED", "RECEIVED"].includes(gift.status)) {
      throw new Error(
        `Gift cannot accept a purchase receipt (status: ${gift.status})`,
      );
    }

    const claimSnapshot = await db.claims
      .where("giftId", "==", gift.id)
      .where("donorId", "==", donorId)
      .where("active", "==", true)
      .get();
    const claimDoc = claimSnapshot.docs[0];
    const claim = claimDoc?.data();

    if (!claimDoc || !claim) {
      throw new Error("Active donor claim not found for this gift");
    }

    const nextTrackingNumber =
      data.trackingNumber?.trim() || claim.purchaseConfirmation?.trackingNumber;

    await claimDoc.ref.update({
      purchaseConfirmation: {
        date: claim.purchaseConfirmation?.date ?? new Date().toISOString(),
        documentationUrl: data.documentationPath,
        verified: claim.purchaseConfirmation?.verified ?? false,
        ...(nextTrackingNumber ? { trackingNumber: nextTrackingNumber } : {}),
      },
    });

    return {
      giftId: gift.id,
      documentationPath: data.documentationPath,
      trackingNumber: nextTrackingNumber ?? "",
    };
  });

export const updateGiftTrackingNumber = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .inputValidator(updateTrackingNumberSchema)
  .handler(async ({ data, context }) => {
    const donorId = context.authUser.uid;
    const db = getServerDB();
    const trackingNumber = data.trackingNumber.trim();

    return await db._instance.runTransaction(async (transaction) => {
      const giftRef = db.gifts.doc(data.giftId);
      const giftDoc = await transaction.get(giftRef);
      const gift = giftDoc.data();

      if (!gift) {
        throw new Error("Gift not found");
      }

      if (gift.claimedByDonorId !== donorId) {
        throw new Error("Gift is not claimed by this donor");
      }

      if (!["PURCHASED", "DELIVERED", "RECEIVED"].includes(gift.status)) {
        throw new Error(
          `Gift cannot accept a tracking number (status: ${gift.status})`,
        );
      }

      const claimSnapshot = await transaction.get(
        db.claims
          .where("giftId", "==", gift.id)
          .where("donorId", "==", donorId)
          .where("active", "==", true),
      );

      if (claimSnapshot.empty) {
        throw new Error("Active donor claim not found for this gift");
      }

      for (const claimDoc of claimSnapshot.docs) {
        const claim = claimDoc.data() as Claim;
        transaction.update(claimDoc.ref, {
          purchaseConfirmation: {
            date: claim.purchaseConfirmation?.date ?? new Date().toISOString(),
            documentationUrl:
              claim.purchaseConfirmation?.documentationUrl ?? "",
            verified: claim.purchaseConfirmation?.verified ?? false,
            ...(trackingNumber ? { trackingNumber } : {}),
          },
        });
      }

      return {
        giftId: gift.id,
        trackingNumber,
      };
    });
  });

export const markGiftDelivered = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .inputValidator(giftIdSchema)
  .handler(async ({ data, context }) => {
    const donorId = context.authUser.uid;
    const db = getServerDB();
    return await db._instance.runTransaction(async (transaction) => {
      const giftRef = db.gifts.doc(data.giftId);
      const giftDoc = await transaction.get(giftRef);
      const gift = giftDoc.data();

      if (!gift) {
        throw new Error("Gift not found");
      }

      if (gift.claimedByDonorId !== donorId) {
        throw new Error("Gift is not claimed by this donor");
      }

      if (gift.status === "DELIVERED" || gift.status === "RECEIVED") {
        return gift;
      }

      if (gift.status !== "PURCHASED") {
        throw new Error(
          `Gift cannot be marked delivered (status: ${gift.status})`,
        );
      }

      const deliveredAt = new Date().toISOString();
      const claimSnapshot = await transaction.get(
        db.claims
          .where("giftId", "==", gift.id)
          .where("donorId", "==", donorId)
          .where("active", "==", true),
      );

      transaction.update(giftRef, {
        status: "DELIVERED",
      });

      for (const claimDoc of claimSnapshot.docs) {
        transaction.update(claimDoc.ref, {
          deliveryConfirmed: {
            date: deliveredAt,
            documentationUrl: "",
            verified: false,
          },
        });
      }

      return {
        ...gift,
        status: "DELIVERED" as const,
      };
    });
  });

export const uploadDeliveryReceipt = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .inputValidator(deliveryReceiptUploadSchema)
  .handler(async ({ data, context }) => {
    const donorId = context.authUser.uid;
    const db = getServerDB();
    const giftDoc = await db.gifts.doc(data.giftId).get();
    const gift = giftDoc.data();

    if (!gift) {
      throw new Error("Gift not found");
    }

    if (gift.claimedByDonorId !== donorId) {
      throw new Error("Gift is not claimed by this donor");
    }

    if (!["DELIVERED", "RECEIVED"].includes(gift.status)) {
      throw new Error(
        `Gift cannot accept a delivery receipt (status: ${gift.status})`,
      );
    }

    const claimSnapshot = await db.claims
      .where("giftId", "==", gift.id)
      .where("donorId", "==", donorId)
      .where("active", "==", true)
      .get();
    const claimDoc = claimSnapshot.docs[0];
    const claim = claimDoc?.data();

    if (!claimDoc || !claim) {
      throw new Error("Active donor claim not found for this gift");
    }

    await claimDoc.ref.update({
      deliveryConfirmed: {
        date: claim.deliveryConfirmed?.date ?? new Date().toISOString(),
        documentationUrl: data.documentationPath,
        verified: claim.deliveryConfirmed?.verified ?? false,
      },
    });

    return {
      giftId: gift.id,
      documentationPath: data.documentationPath,
    };
  });

export const unclaimGifts = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .inputValidator(giftIdsSchema)
  .handler(async ({ data, context }) => {
    const donorId = context.authUser.uid;
    const giftIds = Array.from(new Set(data.giftIds));
    const db = getServerDB();

    await db._instance.runTransaction(async (tx) => {
      const { gifts, driveId } = await loadGifts(tx, db, giftIds);

      await assertGiftDriveActive(tx, driveId);

      for (const gift of gifts) {
        if (gift.claimedByDonorId !== donorId) {
          throw new Error(`Gift ${gift.id} is not claimed by this donor`);
        }
        if (gift.status !== "CLAIMED") {
          throw new Error(
            "Only claimed gifts that have not been purchased can be unclaimed. Please reach out to KFK for help with this gift.",
          );
        }
      }

      const claimSnaps = await Promise.all(
        gifts.map((gift) =>
          tx.get(
            db.claims
              .where("giftId", "==", gift.id)
              .where("donorId", "==", donorId)
              .where("active", "==", true),
          ),
        ),
      );

      for (let i = 0; i < gifts.length; i++) {
        if (claimSnaps[i].empty) {
          throw new Error(`No active claim found for gift ${gifts[i].id}`);
        }
      }

      for (const gift of gifts) {
        tx.update(db.gifts.doc(gift.id), {
          status: "AVAILABLE",
          claimedByDonorId: admin.firestore.FieldValue.delete(),
        });
      }
      for (const snap of claimSnaps) {
        for (const doc of snap.docs) {
          tx.update(doc.ref, { active: false });
        }
      }
    });
  });
