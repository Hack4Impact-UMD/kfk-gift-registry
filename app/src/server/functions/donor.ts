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
import type { CommittedChild } from "@/components/donor/home/types";

const giftIdsSchema = z.object({
  giftIds: z.array(z.string().min(1)).min(1),
});

const giftIdSchema = z.object({
  giftId: z.string().min(1),
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

export const getCommittedChildrenForDonor = createServerFn({ method: "GET" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .handler(async ({ context }) => {
    const donorId = context.authUser.uid;
    const db = getServerDB();

    const claimsSnapshot = await db.claims
      .where("donorId", "==", donorId)
      .where("active", "==", true)
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

      for (const gift of gifts) {
        tx.update(db.gifts.doc(gift.id), {
          claimedByDonorId: donorId,
          status: "CLAIMED",
        });
      }
      for (const claim of claims) {
        tx.set(db.claims.doc(claim.id), claim);
      }

      return { claims };
    });
  });

export const markGiftPurchased = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.DONOR])])
  .inputValidator(giftIdSchema)
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

    await db.gifts.doc(gift.id).update({
      status: "PURCHASED",
    });

    return {
      ...gift,
      status: "PURCHASED" as const,
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
