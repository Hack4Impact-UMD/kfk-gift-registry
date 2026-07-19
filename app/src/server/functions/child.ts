import { getServerDB } from "@/lib/firebase.server";
import z from "zod";
import { createServerFn } from "@tanstack/react-start";
import admin from "firebase-admin";
import { v7 as uuidv7 } from "uuid";
import {
  UserRole,
  ChildSchema,
  GiftSchema,
  GiftFamilyPublicNotesSchema,
  RequiredGiftTitleSchema,
} from "common";
import { getFamilyLinkById } from "../services/familyLinkService.server";
import {
  childPhotoExists,
  deleteChildPhoto,
  uploadChildPhoto,
} from "../services/childPhotoService.server";
import type { ApprovedProfileTableRow } from "@/components/tables/ApprovedProfilesTable/types";
import type { Family, Gift, Child, Claim, UserProfile } from "common";
import type { StorefrontChild, StorefrontGift } from "@/types/storefront";
import { requireRolesMiddleware } from "../middleware/authMiddleware";
import { appCheckMiddleware } from "../middleware/appCheckMiddleware";
import { chunk, isDonorClaim } from "@/lib/utils";

export type FamilyGiftClaim = {
  giftId: string;
  claimType: "donor" | "kfk";
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

export type StaffGiftDetails = {
  donorName: string;
  donorEmail: string;
  trackingId: string;
  dateOrdered: string;
  dateDelivered: string;
  dateReceived: string;
  proofOfPurchasePath: string;
  proofOfDeliveryPath: string;
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

const uploadChildPictureSchema = z.object({
  childId: z.string().min(1),
  dataUrl: z.string().startsWith("data:"),
});

const updateChildSchema = z.object({
  childId: z.string().min(1),
  updates: ChildSchema.omit({
    id: true,
    familyId: true,
    giftDrive: true,
    createdAt: true,
    category: true,
    status: true,
    livesAtHome: true,
  })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

const updateGiftSchema = z.object({
  giftId: z.string().min(1),
  updates: GiftSchema.omit({
    id: true,
    childId: true,
    familyId: true,
    giftDrive: true,
    claimedByDonorId: true,
    createdAt: true,
  })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

const createGiftSchema = z.object({
  childId: z.string().min(1),
  title: RequiredGiftTitleSchema,
  productUrl: z.string().trim().url(),
  listedPrice: z.number().min(0).optional(),
  familyPublicNotes: GiftFamilyPublicNotesSchema.optional(),
  active: z.boolean().default(true),
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

export const getChildProfileTableRows = createServerFn({
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

    // get all children for the active drive
    const allChildren = await getAllChildProfilesForDrive({ data });
    if (allChildren.length === 0) {
      return rows;
    }

    const familyIds = [...new Set(allChildren.map((child) => child.familyId))];

    const families: Array<Family> = [];
    for (let i = 0; i < familyIds.length; i += 10) {
      const batch = familyIds.slice(i, i + 10);
      const familyQuery = await db.families.where("id", "in", batch).get();
      families.push(...familyQuery.docs.map((doc) => doc.data()));
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
      const childGifts = giftsByChildId.get(gift.childId) ?? [];
      childGifts.push(gift);
      giftsByChildId.set(gift.childId, childGifts);
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
        published: child.published,
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

export const getChildGiftDetailsByChildId = createServerFn({ method: "GET" })
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
    const claimsSnapshot = await db.claims
      .where("childId", "==", childId)
      .where("active", "==", true)
      .get();

    if (claimsSnapshot.empty) {
      return {} satisfies Record<string, StaffGiftDetails>;
    }

    const claims = claimsSnapshot.docs.map((doc) => doc.data() as Claim);
    const donorIds = Array.from(
      new Set(
        claims
          .filter(
            (claim): claim is Extract<Claim, { claimType: "donor" }> =>
              claim.claimType === "donor",
          )
          .map((claim) => claim.donorId),
      ),
    );

    const donorProfiles = new Map<string, UserProfile>();
    if (donorIds.length > 0) {
      const donorRefs = donorIds.map((donorId) => db.users.doc(donorId));
      const donorSnapshots = await db._instance.getAll(...donorRefs);

      for (const donorSnapshot of donorSnapshots) {
        if (!donorSnapshot.exists) {
          continue;
        }
        donorProfiles.set(
          donorSnapshot.id,
          donorSnapshot.data() as UserProfile,
        );
      }
    }

    return Object.fromEntries(
      claims.map((claim) => {
        const donorProfile =
          claim.claimType === "donor"
            ? donorProfiles.get(claim.donorId)
            : undefined;
        const donorName =
          donorProfile?.name ??
          claim.organizationName ??
          (claim.claimType === "kfk" ? "KFK" : "");
        const donorEmail = donorProfile?.email ?? "";

        return [
          claim.giftId,
          {
            donorName,
            donorEmail,
            trackingId: claim.purchaseConfirmation?.trackingNumber ?? "",
            dateOrdered: claim.purchaseConfirmation?.date ?? "",
            dateDelivered: claim.deliveryConfirmed?.date ?? "",
            dateReceived: claim.receivedAt ?? "",
            proofOfPurchasePath:
              claim.purchaseConfirmation?.documentationUrl ?? "",
            proofOfDeliveryPath:
              claim.deliveryConfirmed?.documentationUrl ?? "",
          } satisfies StaffGiftDetails,
        ];
      }),
    );
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
//

export type ChildWithGifts = Child & { gifts: Array<Gift> };

export const getChildrenForFamilyWithGifts = createServerFn({ method: "GET" })
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

        const childWithGifts: ChildWithGifts = {
          ...childData,
          id: childDoc.id,
          gifts: gifts.docs.map((g) => ({ ...g.data(), id: g.id })),
        };

        return childWithGifts;
      }),
    );

    return childrenWithGifts;
  });

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
    return childrenSnap.docs.map((d) => d.data());
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
    const child = childDoc.data();
    if (!child) {
      throw new Error("Child not found");
    }

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
    const child = childDoc.data();
    if (!child) {
      throw new Error("Child not found");
    }

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
    const child = childDoc.data();
    if (!child) {
      throw new Error("Child not found");
    }

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
          claimType: claim.claimType,
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
    const child = childDoc.data();
    if (!child) {
      throw new Error("Child not found");
    }

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
              claimType: claim.claimType,
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
    const child = childDoc.data();
    if (!child) {
      throw new Error("Child not found");
    }

    if (child.familyId !== link.familyId) {
      throw new Error("Unauthorized: child does not belong to this family");
    }

    const giftDoc = await db.gifts.doc(giftId).get();
    const gift = giftDoc.data();
    if (!gift) {
      throw new Error("Gift not found");
    }

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
    const child = childDoc.data();
    if (!child) {
      throw new Error("Child not found");
    }

    if (child.familyId !== link.familyId) {
      throw new Error("Unauthorized: child does not belong to this family");
    }

    const giftDoc = await db.gifts.doc(giftId).get();
    const gift = giftDoc.data();
    if (!gift) {
      throw new Error("Gift not found");
    }

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
    const child = childDoc.data();
    if (!child?.published) {
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
            childName: child.name.split(" ")[0],
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
    const child = childDoc.data();
    if (!child?.published) {
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
        childName: child.name.split(" ")[0],
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
    const child = childDoc.data();
    if (!child?.published) {
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
      const siblingGifts = giftsBySiblingId.get(gift.childId) ?? [];
      siblingGifts.push(gift);
      giftsBySiblingId.set(gift.childId, siblingGifts);
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
                childName: sibling.name.split(" ")[0],
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

    if (updates.photoUrl?.startsWith("data:")) {
      throw new Error(
        "photoUrl data URLs must be uploaded via uploadChildPicture",
      );
    }

    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) {
      throw new Error("Child not found");
    }

    const normalizedUpdates =
      updates.photoUrl === ""
        ? {
            ...updates,
            photoUrl: admin.firestore.FieldValue.delete(),
          }
        : updates;

    await db.children.doc(childId).update(normalizedUpdates);

    const updatedChild = await db.children.doc(childId).get();
    const updatedChildData = updatedChild.data();
    if (!updatedChildData) throw new Error("Child not found");
    return updatedChildData;
  });

export const uploadChildPictureStaff = createServerFn({ method: "POST" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(uploadChildPictureSchema)
  .handler(async ({ data }) => {
    const { childId, dataUrl } = data;
    const db = getServerDB();

    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) throw new Error("Child not found");

    const photoUrl = await uploadChildPhoto(childId, dataUrl);
    try {
      await db.children.doc(childId).update({ photoUrl });
    } catch (updateErr) {
      try {
        await deleteChildPhoto(childId);
      } catch (deleteErr) {
        console.error(
          "Failed to delete orphaned photo after Firestore update failure:",
          deleteErr,
        );
      }
      throw updateErr;
    }

    const updatedChild = await db.children.doc(childId).get();
    const updatedChildData = updatedChild.data();
    if (!updatedChildData) throw new Error("Child not found");
    return updatedChildData;
  });

export const uploadChildPictureAppCheck = createServerFn({ method: "POST" })
  .middleware([appCheckMiddleware])
  .inputValidator(uploadChildPictureSchema)
  .handler(async ({ data }) => {
    const { childId, dataUrl } = data;
    const db = getServerDB();

    const childDoc = await db.children.doc(childId).get();
    if (!childDoc.exists) throw new Error("Child not found");

    if (await childPhotoExists(childId))
      throw new Error("Child already has a profile picture uploaded!");

    const photoUrl = await uploadChildPhoto(childId, dataUrl);
    try {
      await db.children.doc(childId).update({ photoUrl });
    } catch (updateErr) {
      try {
        await deleteChildPhoto(childId);
      } catch (deleteErr) {
        console.error(
          "Failed to delete orphaned photo after Firestore update failure:",
          deleteErr,
        );
      }
      throw updateErr;
    }

    const updatedChild = await db.children.doc(childId).get();
    const updatedChildData = updatedChild.data();
    if (!updatedChildData) throw new Error("Child not found");
    return updatedChildData;
  });

export const createGift = createServerFn({ method: "POST" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(createGiftSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const childDoc = await db.children.doc(data.childId).get();
    const child = childDoc.data();
    if (!child) {
      throw new Error("Child not found");
    }
    const existingGifts = await db.gifts
      .where("childId", "==", data.childId)
      .get();
    const activeGiftCount = existingGifts.docs.reduce(
      (count, giftDoc) => count + (giftDoc.data().active ? 1 : 0),
      0,
    );

    if (data.active && activeGiftCount >= 3) {
      throw new Error("This child already has 3 active storefront gifts");
    }

    const createdGift: Gift = {
      id: uuidv7(),
      childId: child.id,
      familyId: child.familyId,
      giftDrive: child.giftDrive,
      title: data.title,
      productUrl: data.productUrl,
      listedPrice: data.listedPrice,
      familyPublicNotes: data.familyPublicNotes,
      status: "AVAILABLE",
      createdAt: new Date().toISOString(),
      active: data.active,
      backup: !data.active,
    };

    await db.gifts.doc(createdGift.id).set(createdGift);

    return createdGift;
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
    const updatedGiftData = updatedGift.data();
    if (!updatedGiftData) throw new Error("Gift not found");
    return updatedGiftData;
  });

export type GiftClaimDetails = {
  giftId: string;
  claimId: string;
  donorName: string | null;
  donorEmail: string | null;
  trackingNumber: string | null;
  dateOrdered: string | null;
  dateDelivered: string | null;
  dateReceived: string | null;
  proofOfPurchasePath: string | null;
  proofOfDeliveryPath: string | null;
};

export const getClaimsWithDonorByChildId = createServerFn({ method: "GET" })
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

    const claimsSnap = await db.claims
      .where("childId", "==", childId)
      .where("active", "==", true)
      .get();

    if (claimsSnap.empty) return [] as Array<GiftClaimDetails>;

    const claims = claimsSnap.docs.map((doc) => doc.data());

    const donorIds = Array.from(
      new Set(claims.filter(isDonorClaim).map((c) => c.donorId)),
    );

    const profileByDonorId = new Map<string, UserProfile>();
    if (donorIds.length > 0) {
      await Promise.all(
        chunk(donorIds, 300).map(async (donorIdChunk) => {
          const refs = donorIdChunk.map((id) => db.users.doc(id));
          const snaps = await db._instance.getAll(...refs);
          for (const snap of snaps) {
            if (snap.exists) {
              profileByDonorId.set(snap.id, snap.data() as UserProfile);
            }
          }
        }),
      );
    }

    return claims.map((claim): GiftClaimDetails => {
      const donor = isDonorClaim(claim)
        ? profileByDonorId.get(claim.donorId)
        : undefined;
      return {
        giftId: claim.giftId,
        claimId: claim.id,
        donorName:
          donor?.name ??
          claim.organizationName ??
          (claim.claimType === "kfk" ? "KFK" : null),
        donorEmail: donor?.email ?? null,
        trackingNumber: claim.purchaseConfirmation?.trackingNumber ?? null,
        dateOrdered: claim.purchaseConfirmation?.date ?? null,
        dateDelivered: claim.deliveryConfirmed?.date ?? null,
        dateReceived: claim.receivedAt ?? null,
        proofOfPurchasePath:
          claim.purchaseConfirmation?.documentationUrl ?? null,
        proofOfDeliveryPath: claim.deliveryConfirmed?.documentationUrl ?? null,
      };
    });
  });

export const updateClaimTrackingNumber = createServerFn({ method: "POST" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(
    z.object({ claimId: z.string().min(1), trackingNumber: z.string() }),
  )
  .handler(async ({ data }) => {
    const { claimId, trackingNumber } = data;
    const db = getServerDB();
    await db.claims.doc(claimId).update({
      "purchaseConfirmation.trackingNumber": trackingNumber,
    });
  });
