import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { Child } from "common";
import { UserRole, FamilySchema, AddressSchema } from "common";
import { getFamilyLinkById } from "../services/familyLinkService.server";
import { getServerDB } from "@/lib/firebase.server";
import { requireRolesMiddleware } from "../middleware/authMiddleware";
import type {
  PendingProfileTableRow,
  ApplicationStatus,
} from "@/components/tables/PendingProfilesTable/types";
import { getChildrenForFamily } from "./child";

const tokenInputSchema = z.object({
  token: z.string().min(1),
});

const familyIdInputSchema = z.object({
  familyId: z.string().min(1),
});

const driveIdInputSchema = z.object({
  driveId: z.string(),
});

function getRequiredData<T>(data: T | undefined, errorMessage: string): T {
  if (!data) {
    throw new Error(errorMessage);
  }

  return data;
}

const updateFamilySchema = z.object({
  familyId: z.string().min(1),
  updates: FamilySchema.omit({
    id: true,
    giftDrive: true,
    createdAt: true,
    reviewStatus: true,
  })
    .extend({ address: AddressSchema.partial() })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const updateFamilyReviewStatusSchema = z.object({
  familyId: z.string().min(1),
  updates: z.object({
    reviewStatus: z
      .object({
        approved: z.boolean(),
        held: z.boolean(),
        reviewNotes: z.string().trim().max(2000).optional(),
        holdNotes: z.string().trim().max(2000).optional(),
      })
      .refine((status) => !(status.approved && status.held), {
        message: "A family cannot be both approved and held",
      }),
    privateNotes: z.string().trim().max(2000).optional(),
  }),
});

export const getFamilyByToken = createServerFn({ method: "GET" })
  .inputValidator(tokenInputSchema)
  .handler(async ({ data }) => {
    const { token } = data;

    // load link by token id
    const link = await getFamilyLinkById(token);

    // reject missing/inactive links
    if (!link || !link.active) {
      throw new Error("Invalid or expired link");
    }

    // load family by familyId
    const db = getServerDB();
    const familyDoc = await db.families.doc(link.familyId).get();

    // throw if family is missing
    if (!familyDoc.exists) {
      throw new Error("Family not found");
    }

    // return family payload
    return familyDoc.data();
  });

export const getFamilyLink = createServerFn({ method: "GET" })
  .inputValidator(tokenInputSchema)
  .handler(async ({ data }) => {
    const { token } = data;

    const link = await getFamilyLinkById(token);

    if (!link) {
      throw new Error("Family link not found");
    }

    return link;
  });

export const getFamilyById = createServerFn({ method: "GET" })
  .inputValidator(familyIdInputSchema)
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
    const familyDoc = await db.families.doc(familyId).get();

    if (!familyDoc.exists) {
      throw new Error("Family not found");
    }

    return familyDoc.data();
  });

export const getActiveFamilyLinkByFamilyId = createServerFn({ method: "GET" })
  .inputValidator(familyIdInputSchema)
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .handler(async ({ data }) => {
    const db = getServerDB();
    const linkSnapshot = await db.familyLinks
      .where("familyId", "==", data.familyId)
      .where("active", "==", true)
      .limit(1)
      .get();

    if (linkSnapshot.empty) {
      return null;
    }

    return linkSnapshot.docs[0].data();
  });

export const getFamilyDashboardDataByToken = createServerFn({ method: "GET" })
  .inputValidator(tokenInputSchema)
  .handler(async ({ data }) => {
    const { token } = data;

    // Validate token and load family link
    const link = await getFamilyLinkById(token);

    if (!link || !link.active) {
      throw new Error("Invalid or expired link");
    }

    const db = getServerDB();

    // Load family by familyId
    const familyDoc = await db.families.doc(link.familyId).get();

    if (!familyDoc.exists) {
      throw new Error("Family not found");
    }

    const familyData = getRequiredData(
      familyDoc.data(),
      "Family data unavailable",
    );

    // Load children for this family
    const childProfiles = await db.children
      .where("familyId", "==", link.familyId)
      .get();

    const children = childProfiles.docs.map((doc) => doc.data());

    // Return only public fields
    return {
      family: {
        id: familyData.id,
        contactName: familyData.contactName,
        giftDrive: familyData.giftDrive,
      },
      children,
    };
  });

export const updateFamily = createServerFn({ method: "POST" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(updateFamilySchema)
  .handler(async ({ data }) => {
    const { familyId, updates } = data;
    const db = getServerDB();

    const familyDoc = await db.families.doc(familyId).get();
    if (!familyDoc.exists) {
      throw new Error("Family not found");
    }

    await db.families.doc(familyId).update(updates);

    const updatedFamily = await db.families.doc(familyId).get();
    return getRequiredData(
      updatedFamily.data(),
      "Family data unavailable after update",
    );
  });

export const getProfileTableRows = createServerFn({ method: "GET" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.VOLUNTEER,
    ]),
  ])
  .inputValidator(driveIdInputSchema)
  .handler(async ({ data }) => {
    const { driveId } = data;
    const db = getServerDB();
    const rows: Array<PendingProfileTableRow> = [];

    const familiesSnapshot = await db.families
      .where("giftDrive", "==", driveId)
      .get();

    if (familiesSnapshot.empty) {
      return rows;
    }

    const families = familiesSnapshot.docs.map((doc) => doc.data());
    const familyIds = families.map((f) => f.id);

    const childCountMap = new Map<
      string,
      { total: number; published: number }
    >();

    for (let i = 0; i < familyIds.length; i += 10) {
      const batch = familyIds.slice(i, i + 10);
      const childrenSnapshot = await db.children
        .where("familyId", "in", batch)
        .get();

      for (const childDoc of childrenSnapshot.docs) {
        const child = childDoc.data();
        const existingCounts = childCountMap.get(child.familyId) ?? {
          total: 0,
          published: 0,
        };
        childCountMap.set(child.familyId, {
          total: existingCounts.total + 1,
          published: existingCounts.published + (child.published ? 1 : 0),
        });
      }
    }

    for (const family of families) {
      let status: ApplicationStatus;
      const reviewStatus = family.reviewStatus;
      const childCounts = childCountMap.get(family.id) ?? {
        total: 0,
        published: 0,
      };

      if (reviewStatus?.approved) {
        status = "approved";
      } else if (reviewStatus?.held) {
        status = "holdfile";
      } else {
        status = "pending";
      }

      const row: PendingProfileTableRow = {
        id: family.id,
        parentGuardian: family.contactName,
        numberOfChildren: childCounts.total,
        publishedChildren: childCounts.published,
        status,
        submissionDate: family.createdAt,
        adminComments:
          reviewStatus?.reviewNotes || reviewStatus?.holdNotes || "",
      };
      rows.push(row);
    }

    return rows;
  });

export const updateFamilyReviewStatus = createServerFn({ method: "POST" })
  .middleware([requireRolesMiddleware([UserRole.ADMIN, UserRole.DIRECTOR])])
  .inputValidator(updateFamilyReviewStatusSchema)
  .handler(async ({ data, context }) => {
    const { familyId, updates } = data;
    const db = getServerDB();

    const staffId = context.authUser.uid;

    const familyDoc = await db.families.doc(familyId).get();
    if (!familyDoc.exists) {
      throw new Error("Family not found");
    }

    const reviewUpdates = {
      "reviewStatus.approved": updates.reviewStatus.approved,
      "reviewStatus.held": updates.reviewStatus.held,
      "reviewStatus.reviewNotes": updates.reviewStatus.reviewNotes ?? "",
      "reviewStatus.holdNotes": updates.reviewStatus.holdNotes ?? "",
      "reviewStatus.reviewedBy": staffId ?? "",
      "reviewStatus.lastReviewedAt": new Date().toISOString(),
      ...(updates.privateNotes && { privateNotes: updates.privateNotes }),
    };

    await db.families.doc(familyId).update(reviewUpdates);

    const updatedFamily = await db.families.doc(familyId).get();
    return getRequiredData(
      updatedFamily.data(),
      "Family data unavailable after review update",
    );
  });

const publishFamiliesSchema = z.array(z.string().nonempty());

export const publishFamilies = createServerFn({ method: "POST" })
  .middleware([
    requireRolesMiddleware([
      UserRole.ADMIN,
      UserRole.VOLUNTEER,
      UserRole.DIRECTOR,
    ]),
  ])
  .inputValidator(publishFamiliesSchema)
  .handler(async ({ data: familyIds }) => {
    const db = getServerDB();
    const families = await Promise.all(
      familyIds.map((id) => getFamilyById({ data: { familyId: id } })),
    );
    if (families.some((f) => !f?.reviewStatus.approved)) {
      throw new Error("Can't publish a family that was not approved!");
    }
    const children: Array<Child> = (
      await Promise.all(
        familyIds.map(
          async (id) => await getChildrenForFamily({ data: { familyId: id } }),
        ),
      )
    )
      .flatMap((cs) => cs)
      .filter((c) => !c.published);

    await db._instance.runTransaction(async (tx) => {
      children.map((c) =>
        tx.update(db.children.doc(c.id), {
          published: true,
        } satisfies Partial<Child>),
      );
    });
  });
