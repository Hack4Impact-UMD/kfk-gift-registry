import { getServerDB } from "@/lib/firebase.server";
import z from "zod";
import { createServerFn } from "@tanstack/react-start";
import { UserRole } from "common";
import { getFamilyLinkById } from "../services/familyLinkService.server";
import type { ApprovedProfileTableRow } from "@/components/tables/ApprovedProfilesTable/types";
import type { Child, Gift, GiftStatus } from "common";
import type { StorefrontChild, StorefrontGift } from "@/types/storefront";
import { requireRolesMiddleware } from "../middleware/authMiddleware";

export type FamilyGiftClaim = {
  giftId: string;
  claimedAt: string;
  purchaseConfirmation?: {
    date: string;
    trackingNumber?: string;
  };
  deliveryConfirmed?: {
    date: string;
  };
  expectedDeliveryDate?: string;
  receivedAt?: string;
  thankYouNote?: string;
};

const childParamSchema = z.object({
  // just so it's clean for the input validator
  driveId: z.string(),
});

const familyIdSchema = z.object({
  familyId: z.string().min(1),
});

const childIdSchema = z.object({
  childId: z.string().min(1),
});

const tokenChildSchema = z.object({
  token: z.string().min(1),
  childId: z.string().min(1),
});

const tokenChildGiftsSchema = z.object({
  token: z.string().min(1),
  childId: z.string().min(1),
});

const tokenChildClaimsSchema = z.object({
  token: z.string().min(1),
  childId: z.string().min(1),
});

const tokenGiftConfirmationSchema = z.object({
  token: z.string().min(1),
  childId: z.string().min(1),
  giftId: z.string().min(1),
});

const tokenGiftThankYouNoteSchema = z.object({
  token: z.string().min(1),
  childId: z.string().min(1),
  giftId: z.string().min(1),
  note: z.string().trim().min(1).max(1000),
});

const updateChildSchema = z.object({
  childId: z.string().min(1),
  updates: z
    .object({
      // These are all for text fields
      name: z.string().trim().min(1).max(100),
      diagnosis: z.string().trim().min(1).max(200),
      hospital: z.string().trim().min(1).max(200),
      childSocialWorker: z.string().trim().min(1).max(100),
      publicBlurb: z.string().trim().min(1).max(1000),
      staffPrivateNotes: z.string().trim().min(1).max(2000),
      photoUrl: z.url(),

      // Constrained choices requiring dropdowns/radios, etc.
      age: z.number().min(1),
      treatmentLevel: z.number().min(0).max(3),
      published: z.boolean(),
      diagnosisLengthYears: z.enum(["<6m", "6m-1y", "1-2y", "3-4y", "5+y"]),
      offTreatmentDurationYears: z.enum([
        "<6m",
        "6m-1y",
        "1-2y",
        "3-4y",
        "5+y",
      ]),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

const updateGiftSchema = z.object({
  giftId: z.string().min(1),
  updates: z
    .object({
      title: z.string().trim().min(1).max(100),
      listedPrice: z.number().min(0),
      status: z.enum([
        "AVAILABLE",
        "CLAIMED",
        "PURCHASED",
        "DELIVERED",
        "RECEIVED",
      ] as const satisfies ReadonlyArray<GiftStatus>),
      familyPublicNotes: z.string().trim().max(500),
      active: z.boolean(),
      backup: z.boolean(),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const getAllChildProfilesForDrive = createServerFn({
  method: "GET",
})
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(childParamSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const childProfiles = await db.children
      .where("giftDrive", "==", data.driveId)
      .get();
    if (childProfiles.empty) {
      return [];
    }
    return childProfiles.docs.map((doc) => doc.data());
  });

export const getAllApprovedFamilyProfilesForDrive = createServerFn({
  method: "GET",
})
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(childParamSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const familyProfiles = await db.families
      .where("giftDrive", "==", data.driveId)
      .where("reviewStatus.approved", "==", true)
      .get();
    if (familyProfiles.empty) {
      return [];
    }
    return familyProfiles.docs.map((doc) => doc.data());
  });

export const getApprovedProfileTableRows = createServerFn({
  method: "GET",
})
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(childParamSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const rows: Array<ApprovedProfileTableRow> = [];

    // 1. Get all approved families
    const families = await getAllApprovedFamilyProfilesForDrive({ data });
    if (families.length === 0) {
      return rows;
    }

    const familyIds = families.map((f) => f.id);

    // 2. Batch-fetch all children for these families (Firestore `in` max 10)
    const allChildren: Array<Child> = [];
    for (let i = 0; i < familyIds.length; i += 10) {
      const batch = familyIds.slice(i, i + 10);
      const childrenQuery = await db.children
        .where("familyId", "in", batch)
        .get();
      allChildren.push(...childrenQuery.docs.map((doc) => doc.data()));
    }

    if (allChildren.length === 0) {
      return rows;
    }

    const childIds = allChildren.map((c) => c.id);

    // 3. Batch-fetch all gifts for these children (Firestore `in` max 10)
    const allGifts: Array<Gift> = [];
    for (let i = 0; i < childIds.length; i += 10) {
      const batch = childIds.slice(i, i + 10);
      const giftsQuery = await db.gifts.where("childId", "in", batch).get();
      allGifts.push(...giftsQuery.docs.map((doc) => doc.data()));
    }

    // 4. Index gifts by childId for O(1) lookup
    const giftsByChildId = new Map<string, Array<Gift>>();
    for (const gift of allGifts) {
      if (!giftsByChildId.has(gift.childId)) {
        giftsByChildId.set(gift.childId, []);
      }
      giftsByChildId.get(gift.childId)!.push(gift);
    }

    // 5. Index families by id for O(1) lookup
    const familiesById = new Map(families.map((f) => [f.id, f]));

    // 6. Compose rows in memory
    for (const child of allChildren) {
      const family = familiesById.get(child.familyId);
      if (!family) continue;

      const gifts = giftsByChildId.get(child.id) || [];
      const row: ApprovedProfileTableRow = {
        id: child.id,
        childName: child.name,
        profilePictureUrl: child.photoUrl,
        parentGuardian: family.contactName,
        email: family.email,
        age: child.age,
        diagnosis: child.diagnosis,
        type: child.category === "warrior" ? "warrior" : "supersib",
        giftsFulfilled: gifts.filter((g) =>
          ["CLAIMED", "PURCHASED", "DELIVERED", "RECEIVED"].includes(g.status),
        ).length,
        giftsTotal: gifts.length,
      };
      rows.push(row);
    }

    return rows;
  });

export const getChildProfilesForFamily = createServerFn({ method: "GET" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(familyIdSchema)
  .handler(async ({ data }) => {
    const { familyId } = data;

    const db = getServerDB();
    const childProfiles = await db.children
      .where("familyId", "==", familyId)
      .get();

    if (childProfiles.empty) {
      return [];
    }

    return childProfiles.docs.map((doc) => doc.data());
  });

export const getChildById = createServerFn({ method: "GET" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(childIdSchema)
  .handler(async ({ data }) => {
    const { childId } = data;

    const db = getServerDB();
    const childDoc = await db.children.doc(childId).get();

    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    return childDoc.data();
  });

export const getChildGiftsByChildId = createServerFn({ method: "GET" })
  .inputValidator(childIdSchema)
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .handler(async ({ data }) => {
    const { childId } = data;

    const db = getServerDB();
    const gifts = await db.gifts.where("childId", "==", childId).get();

    if (gifts.empty) {
      return [];
    }

    return gifts.docs.map((doc) => doc.data());
  });

// export const getChildrenForFamily = createServerFn({ method: "GET" })
//   .inputValidator(familyIdSchema)
//   .middleware([
//     requireRolesMiddleware([
//       UserRole.ADMIN,
//       UserRole.DIRECTOR,
//       UserRole.VOLUNTEER,
//     ]),
//   ])
//   .handler(async ({ data }) => {
//     const children = await getChildProfilesForFamily({
//       data: { familyId: data.familyId },
//     });

//     const childrenWithGifts = children.map(async (child) => {
//       const gifts = await getChildGiftsByChildId({
//         data: { childId: child.id },
//       });
//       return {
//         ...child,
//         gifts: gifts,
//       };
//     });

//     return childrenWithGifts
//   });

export const getChildrenForFamily = createServerFn({ method: "GET" })
  .inputValidator(familyIdSchema)
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .handler(async ({ data }) => {
    const { familyId } = data;
    const db = getServerDB();

    // Fetches all children in this family
    const childrenSnap = await db.children
      .where("familyId", "==", familyId)
      .get();

    if (childrenSnap.empty) {
      return [];
    }

    // Using Promise.all to fetch gifts for all children in parallel
    const childrenWithGifts = await Promise.all(
      childrenSnap.docs.map(async (childDoc) => {
        const childData = childDoc.data();

        const gifts = await db.gifts.where("childId", "==", childDoc.id).get();

        return {
          ...childData,
          id: childDoc.id,
          gifts: gifts.docs.map((g) => ({ ...g.data(), id: g.id })),
        };
      }),
    );

    return childrenWithGifts;
  });

/**
 * Token-authenticated child retrieval.
 * Validates that the token has access to the requested child before returning data.
 */
export const getChildByIdWithToken = createServerFn({ method: "GET" })
  .inputValidator(tokenChildSchema)
  .handler(async ({ data }) => {
    const { token, childId } = data;

    // Validate token
    const link = await getFamilyLinkById(token);
    if (!link || !link.active) {
      throw new Error("Invalid or expired link");
    }

    const db = getServerDB();

    // Fetch child
    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const child = childDoc.data()!;

    // Verify child belongs to the token's family
    if (child.familyId !== link.familyId) {
      throw new Error("Unauthorized: child does not belong to this family");
    }

    return child;
  });

/**
 * Token-authenticated child gifts retrieval.
 * Validates that the token has access to the child before returning its gifts.
 */
export const getChildGiftsByChildIdWithToken = createServerFn({
  method: "GET",
})
  .inputValidator(tokenChildGiftsSchema)
  .handler(async ({ data }) => {
    const { token, childId } = data;

    // Validate token
    const link = await getFamilyLinkById(token);
    if (!link || !link.active) {
      throw new Error("Invalid or expired link");
    }

    const db = getServerDB();

    // Fetch child to verify ownership
    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const child = childDoc.data()!;

    // Verify child belongs to the token's family
    if (child.familyId !== link.familyId) {
      throw new Error("Unauthorized: child does not belong to this family");
    }

    // Fetch gifts
    const gifts = await db.gifts.where("childId", "==", childId).get();
    if (gifts.empty) {
      return [];
    }

    return gifts.docs.map((doc) => doc.data());
  });

export const getChildClaimsByChildIdWithToken = createServerFn({
  method: "GET",
})
  .inputValidator(tokenChildClaimsSchema)
  .handler(async ({ data }) => {
    const { token, childId } = data;

    const link = await getFamilyLinkById(token);
    if (!link || !link.active) {
      throw new Error("Invalid or expired link");
    }

    const db = getServerDB();

    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const child = childDoc.data()!;
    if (child.familyId !== link.familyId) {
      throw new Error("Unauthorized: child does not belong to this family");
    }

    const claims = await db.claims.where("childId", "==", childId).get();
    if (claims.empty) {
      return [];
    }

    return claims.docs
      .map((doc) => doc.data())
      .filter((claim) => claim.active)
      .map(
        (claim): FamilyGiftClaim => ({
          giftId: claim.giftId,
          claimedAt: claim.claimedAt,
          purchaseConfirmation: claim.purchaseConfirmation
            ? {
                date: claim.purchaseConfirmation.date,
                trackingNumber: claim.purchaseConfirmation.trackingNumber,
              }
            : undefined,
          deliveryConfirmed: claim.deliveryConfirmed
            ? {
                date: claim.deliveryConfirmed.date,
              }
            : undefined,
          expectedDeliveryDate: claim.expectedDeliveryDate,
          receivedAt: claim.receivedAt,
          thankYouNote: claim.thankYouNote,
        }),
      );
  });

export const getFamilyChildDataByToken = createServerFn({ method: "GET" })
  .inputValidator(tokenChildSchema)
  .handler(async ({ data }) => {
    const { token, childId } = data;

    const link = await getFamilyLinkById(token);
    if (!link || !link.active) {
      throw new Error("Invalid or expired link");
    }

    const db = getServerDB();
    const childDoc = await db.children.doc(childId).get();

    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const child = childDoc.data()!;
    if (child.familyId !== link.familyId) {
      throw new Error("Unauthorized: child does not belong to this family");
    }

    const [giftsSnapshot, claimsSnapshot] = await Promise.all([
      db.gifts.where("childId", "==", childId).get(),
      db.claims.where("childId", "==", childId).get(),
    ]);

    const gifts = giftsSnapshot.empty
      ? []
      : giftsSnapshot.docs
          .map((doc) => doc.data())
          .filter((gift) => !gift.backup);

    const claims = claimsSnapshot.empty
      ? []
      : claimsSnapshot.docs
          .map((doc) => doc.data())
          .filter((claim) => claim.active)
          .map(
            (claim): FamilyGiftClaim => ({
              giftId: claim.giftId,
              claimedAt: claim.claimedAt,
              purchaseConfirmation: claim.purchaseConfirmation
                ? {
                    date: claim.purchaseConfirmation.date,
                    trackingNumber: claim.purchaseConfirmation.trackingNumber,
                  }
                : undefined,
              deliveryConfirmed: claim.deliveryConfirmed
                ? {
                    date: claim.deliveryConfirmed.date,
                  }
                : undefined,
              expectedDeliveryDate: claim.expectedDeliveryDate,
              receivedAt: claim.receivedAt,
              thankYouNote: claim.thankYouNote,
            }),
          );

    return {
      child,
      gifts,
      claims,
    };
  });

export const saveGiftThankYouNoteWithToken = createServerFn({
  method: "POST",
})
  .inputValidator(tokenGiftThankYouNoteSchema)
  .handler(async ({ data }) => {
    const { token, childId, giftId, note } = data;

    const link = await getFamilyLinkById(token);
    if (!link || !link.active) {
      throw new Error("Invalid or expired link");
    }

    const db = getServerDB();

    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const child = childDoc.data()!;
    if (child.familyId !== link.familyId) {
      throw new Error("Unauthorized: child does not belong to this family");
    }

    const giftDoc = await db.gifts.doc(giftId).get();
    if (!giftDoc.exists) {
      throw new Error("Gift not found");
    }

    const gift = giftDoc.data()!;
    if (gift.childId !== childId || gift.familyId !== link.familyId) {
      throw new Error("Unauthorized: gift does not belong to this family");
    }

    const claims = await db.claims.where("giftId", "==", giftId).get();
    const activeClaim = claims.docs
      .map((doc) => doc.data())
      .find((claim) => claim.active);

    if (!activeClaim) {
      throw new Error("No donor claim found for this gift");
    }

    await db.claims.doc(activeClaim.id).update({
      thankYouNote: note,
    });

    return {
      giftId,
      thankYouNote: note,
    };
  });

export const confirmGiftReceivedWithToken = createServerFn({
  method: "POST",
})
  .inputValidator(tokenGiftConfirmationSchema)
  .handler(async ({ data }) => {
    const { token, childId, giftId } = data;

    const link = await getFamilyLinkById(token);
    if (!link || !link.active) {
      throw new Error("Invalid or expired link");
    }

    const db = getServerDB();

    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const child = childDoc.data()!;
    if (child.familyId !== link.familyId) {
      throw new Error("Unauthorized: child does not belong to this family");
    }

    const giftDoc = await db.gifts.doc(giftId).get();
    if (!giftDoc.exists) {
      throw new Error("Gift not found");
    }

    const gift = giftDoc.data()!;
    if (gift.childId !== childId || gift.familyId !== link.familyId) {
      throw new Error("Unauthorized: gift does not belong to this family");
    }

    if (gift.status === "RECEIVED") {
      return gift;
    }

    if (gift.status !== "DELIVERED") {
      throw new Error("Only delivered gifts can be confirmed as received");
    }

    const claims = await db.claims.where("giftId", "==", giftId).get();
    const activeClaim = claims.docs
      .map((doc) => doc.data())
      .find((claim) => claim.active);
    const receivedAt = new Date().toISOString();

    const batch = db._instance.batch();

    batch.update(db.gifts.doc(giftId), {
      status: "RECEIVED",
    });

    if (activeClaim) {
      batch.update(db.claims.doc(activeClaim.id), {
        receivedAt,
      });
    }

    await batch.commit();

    return {
      ...gift,
      status: "RECEIVED" as const,
    };
  });

export const getStorefrontChildById = createServerFn({ method: "GET" })
  .inputValidator(childIdSchema)
  .handler(async ({ data }) => {
    const { childId } = data;
    const db = getServerDB();
    const childDoc = await db.children.doc(childId).get();

    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const child = childDoc.data()!;

    if (!child.published) {
      throw new Error("Child not found");
    }

    const gifts = await db.gifts
      .where("childId", "==", childId)
      .where("active", "==", true)
      .get();
    const giftData = gifts.docs.map((doc) => doc.data());

    const storefrontChild: StorefrontChild = {
      id: child.id,
      name: child.name,
      age: child.age,
      status: child.status,
      diagnosis: child.diagnosis,
      category: child.category,
      photoUrl: child.photoUrl,
      publicBlurb: child.publicBlurb,
      published: child.published,
      gifts: giftData.map(
        (g) =>
          ({
            id: g.id,
            title: g.title,
            productUrl: g.productUrl,
            listedPrice: g.listedPrice,
            status: g.status,
            familyPublicNotes: g.familyPublicNotes,
            childId: g.childId,
            familyId: g.familyId,
          }) satisfies StorefrontChild["gifts"][number],
      ),
    };

    return storefrontChild;
  });

export const getStorefrontGiftsForChild = createServerFn({ method: "GET" })
  .inputValidator(childIdSchema)
  .handler(async ({ data }) => {
    const { childId } = data;

    const db = getServerDB();

    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const child = childDoc.data()!;
    if (!child.published) {
      throw new Error("Child not found");
    }

    const gifts = await db.gifts
      .where("childId", "==", childId)
      .where("active", "==", true)
      .get();

    if (gifts.empty) {
      return [];
    }

    return gifts.docs.map((doc) => {
      const giftData = doc.data();
      return {
        id: doc.id,
        title: giftData.title,
        productUrl: giftData.productUrl,
        listedPrice: giftData.listedPrice,
        status: giftData.status,
        familyPublicNotes: giftData.familyPublicNotes,
        childId: giftData.childId,
        familyId: giftData.familyId,
      } satisfies StorefrontGift;
    });
  });

export const getStorefrontSiblingsForChild = createServerFn({ method: "GET" })
  .inputValidator(childIdSchema)
  .handler(async ({ data }) => {
    const { childId } = data;
    const db = getServerDB();
    const childDoc = await db.children.doc(childId).get();

    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const child = childDoc.data()!;

    if (!child.published) {
      throw new Error("Child not found");
    }

    const siblingsQuery = await db.children
      .where("familyId", "==", child.familyId)
      .where("published", "==", true)
      .get();
    const siblings = siblingsQuery.docs
      .map((doc) => doc.data())
      .filter((sibling) => sibling.id !== childId);

    if (siblings.length === 0) {
      return [];
    }

    const siblingIds = siblings.map((s) => s.id);

    const allGifts: Array<Gift> = [];
    for (let i = 0; i < siblingIds.length; i += 10) {
      const batch = siblingIds.slice(i, i + 10);
      const giftsQuery = await db.gifts
        .where("childId", "in", batch)
        .where("active", "==", true)
        .get();
      allGifts.push(...giftsQuery.docs.map((doc) => doc.data()));
    }

    const giftsBySiblingId = new Map<string, Array<Gift>>();
    for (const gift of allGifts) {
      if (!giftsBySiblingId.has(gift.childId)) {
        giftsBySiblingId.set(gift.childId, []);
      }
      giftsBySiblingId.get(gift.childId)!.push(gift);
    }

    const storefrontSiblings: Array<StorefrontChild> = siblings.map(
      (sibling) => {
        const giftData = giftsBySiblingId.get(sibling.id) || [];
        return {
          id: sibling.id,
          name: sibling.name,
          age: sibling.age,
          status: sibling.status,
          diagnosis: sibling.diagnosis,
          category: sibling.category,
          photoUrl: sibling.photoUrl,
          publicBlurb: sibling.publicBlurb,
          published: sibling.published,
          gifts: giftData.map(
            (g) =>
              ({
                id: g.id,
                title: g.title,
                productUrl: g.productUrl,
                listedPrice: g.listedPrice,
                status: g.status,
                familyPublicNotes: g.familyPublicNotes,
                childId: g.childId,
                familyId: g.familyId,
              }) satisfies StorefrontGift,
          ),
        };
      },
    );

    return storefrontSiblings;
  });

export const updateChild = createServerFn({ method: "POST" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(updateChildSchema)
  .handler(async ({ data }) => {
    const { childId, updates } = data;
    const db = getServerDB();

    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    await db.children.doc(childId).update(updates);

    const updatedChild = await db.children.doc(childId).get();

    return updatedChild.data()!;
  });

export const updateGift = createServerFn({ method: "POST" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(updateGiftSchema)
  .handler(async ({ data }) => {
    const { giftId, updates } = data;
    const db = getServerDB();

    const giftDoc = await db.gifts.doc(giftId).get();

    if (!giftDoc.exists) {
      throw new Error("Gift not found");
    }

    await db.gifts.doc(giftId).update(updates);

    const updatedGift = await db.gifts.doc(giftId).get();
    return updatedGift.data()!;
  });
