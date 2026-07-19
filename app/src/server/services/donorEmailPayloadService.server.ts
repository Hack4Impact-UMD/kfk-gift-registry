import type {
  Claim,
  Child,
  DonorClaimFamilyShipping,
  DonorClaimGiftSummary,
  DonorPostClaimConfirmationPayload,
  DonorPurchaseReminderPayload,
  Family,
  Gift,
  UserProfile,
} from "common";
import { getServerDB } from "@/lib/firebase.server";

function assertDonorClaim(
  claim: Claim,
): asserts claim is Extract<Claim, { claimType: "donor" }> {
  if (claim.claimType !== "donor") {
    throw new Error(`Claim ${claim.id} is not a donor claim`);
  }
}

function buildGiftSummary(params: {
  gift: Gift;
  child: Child;
  family: Family;
}): DonorClaimGiftSummary {
  const { gift, child, family } = params;

  return {
    giftId: gift.id,
    childId: child.id,
    childName: child.name,
    familyId: family.id,
    familyName: family.contactName,
    giftTitle: gift.title,
    productUrl: gift.productUrl,
    listedPrice: gift.listedPrice,
    familyPublicNotes: gift.familyPublicNotes,
  };
}

function buildFamilyShipping(family: Family): DonorClaimFamilyShipping {
  return {
    familyId: family.id,
    familyName: family.contactName,
    contactName: family.contactName,
    addressLine1: family.address.street,
    addressLine2: family.address.addressLine2,
    city: family.address.city,
    state: family.address.state,
    zipCode: family.address.zipCode,
    phone: family.phone,
  };
}

async function loadClaimContext(claims: Array<Claim>) {
  const db = getServerDB();

  const giftIds = Array.from(new Set(claims.map((claim) => claim.giftId)));
  const childIds = Array.from(new Set(claims.map((claim) => claim.childId)));

  const [giftSnapshots, childSnapshots] = await Promise.all([
    db._instance.getAll(...giftIds.map((giftId) => db.gifts.doc(giftId))),
    db._instance.getAll(...childIds.map((childId) => db.children.doc(childId))),
  ]);

  const giftsById = new Map<string, Gift>();
  for (const snapshot of giftSnapshots) {
    const gift = snapshot.data();
    if (gift) {
      giftsById.set(snapshot.id, gift as Gift);
    }
  }

  const childrenById = new Map<string, Child>();
  for (const snapshot of childSnapshots) {
    const child = snapshot.data();
    if (child) {
      childrenById.set(snapshot.id, child as Child);
    }
  }

  const familyIds = Array.from(
    new Set(Array.from(childrenById.values()).map((child) => child.familyId)),
  );

  const familySnapshots = await db._instance.getAll(
    ...familyIds.map((familyId) => db.families.doc(familyId)),
  );

  const familiesById = new Map<string, Family>();
  for (const snapshot of familySnapshots) {
    const family = snapshot.data();
    if (family) {
      familiesById.set(snapshot.id, family as Family);
    }
  }

  return {
    giftsById,
    childrenById,
    familiesById,
  };
}

function buildSharedPayloadData(params: {
  donor: UserProfile;
  claims: Array<Claim>;
  giftsById: Map<string, Gift>;
  childrenById: Map<string, Child>;
  familiesById: Map<string, Family>;
}) {
  const { donor, claims, giftsById, childrenById, familiesById } = params;

  const giftSummaries: Array<DonorClaimGiftSummary> = [];
  const shippingByFamily = new Map<string, DonorClaimFamilyShipping>();

  for (const claim of claims) {
    assertDonorClaim(claim);

    const gift = giftsById.get(claim.giftId);
    const child = childrenById.get(claim.childId);
    const family = child ? familiesById.get(child.familyId) : undefined;

    if (!gift) {
      throw new Error(`Gift ${claim.giftId} not found for claim ${claim.id}`);
    }
    if (!child) {
      throw new Error(`Child ${claim.childId} not found for claim ${claim.id}`);
    }
    if (!family) {
      throw new Error(
        `Family ${child.familyId} not found for claim ${claim.id}`,
      );
    }

    giftSummaries.push(
      buildGiftSummary({
        gift,
        child,
        family,
      }),
    );

    if (!shippingByFamily.has(family.id)) {
      shippingByFamily.set(family.id, buildFamilyShipping(family));
    }
  }

  const firstClaim = claims[0];
  assertDonorClaim(firstClaim);

  return {
    donorId: donor.id,
    donorName: donor.name,
    donorEmail: donor.email,
    driveId: firstClaim.driveId,
    claimIds: claims.map((claim) => claim.id),
    giftIds: claims.map((claim) => claim.giftId),
    claimedAt: firstClaim.claimedAt,
    gifts: giftSummaries,
    shippingByFamily: Array.from(shippingByFamily.values()),
  };
}

export async function buildDonorPostClaimConfirmationPayload(params: {
  donor: UserProfile;
  claims: Array<Claim>;
}): Promise<DonorPostClaimConfirmationPayload> {
  if (params.claims.length === 0) {
    throw new Error("Cannot build confirmation payload without claims");
  }

  const context = await loadClaimContext(params.claims);

  return buildSharedPayloadData({
    donor: params.donor,
    claims: params.claims,
    ...context,
  });
}

export async function buildDonorPurchaseReminderPayload(params: {
  donor: UserProfile;
  claims: Array<Claim>;
  reminderReason?: string;
}): Promise<DonorPurchaseReminderPayload> {
  if (params.claims.length === 0) {
    throw new Error("Cannot build reminder payload without claims");
  }

  const context = await loadClaimContext(params.claims);

  return {
    ...buildSharedPayloadData({
      donor: params.donor,
      claims: params.claims,
      ...context,
    }),
    reminderReason: params.reminderReason,
  };
}
