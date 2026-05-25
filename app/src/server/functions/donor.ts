import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import admin from "firebase-admin";
import { DateTime } from "luxon";
import { v7 as uuidv7 } from "uuid";
import type { Claim, Gift } from "common";
import { UserRole } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import { assertGiftDriveActive } from "@/server/services/giftDriveService.server";
import { publishNotification, createNotificationMessage } from "@/server/services/notificationService.server";

const giftIdsSchema = z.object({
  giftIds: z.array(z.string().min(1)).min(1),
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

export const claimGifts = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .inputValidator(giftIdsSchema)
  .handler(async ({ data, context }) => {
    const donorId = context.authUser.uid;
    const giftIds = Array.from(new Set(data.giftIds));
    const db = getServerDB();

    return await db._instance.runTransaction(async (tx) => {
      const { gifts, driveId } = await loadGifts(tx, db, giftIds);

      await assertGiftDriveActive(tx, driveId);

      for (const gift of gifts) {
        if (gift.status !== "AVAILABLE") {
          throw new Error(
            `Gift ${gift.id} is not available (status: ${gift.status})`,
          );
        }
      }

      const claimedAt = DateTime.utc().toISO();
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

      // Get donor info for notification
      const donorSnap = await tx.get(db.users.doc(donorId));
      const donorName = donorSnap.exists ? (donorSnap.data() as any).name : "A donor";

      for (const gift of gifts) {
        tx.update(db.gifts.doc(gift.id), {
          claimedByDonorId: donorId,
          status: "CLAIMED",
        });

        // Get child info for notification
        const childSnap = await tx.get(db.children.doc(gift.childId));
        if (childSnap.exists) {
          const child = childSnap.data() as any;
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
            read: false,
          });
        }
      }

      for (const claim of claims) {
        tx.set(db.claims.doc(claim.id), claim);
      }

      return { claims };
    });
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
            `Gift ${gift.id} cannot be unclaimed (status: ${gift.status})`,
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
