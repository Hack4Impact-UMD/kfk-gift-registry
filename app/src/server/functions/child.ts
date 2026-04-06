import { getServerDB } from "@/lib/firebase.server";
import z from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { ApprovedProfileTableRow } from "@/components/tables/ApprovedProfilesTable/types";

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

export const getAllChildProfilesForDrive = createServerFn({
  method: "GET",
})
  .inputValidator(childParamSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const childProfiles = await db.children
      .where("giftDrive", "==", data.driveId)
      .get();
    if (childProfiles.empty) {
      throw new Error("No child profiles exist for this specific drive ID.");
    }
    return childProfiles.docs.map((doc) => doc.data());
  });

export const getAllApprovedFamilyProfilesForDrive = createServerFn({
  method: "GET",
})
  .inputValidator(childParamSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const familyProfiles = await db.families
      .where("giftDrive", "==", data.driveId)
      .where("reviewStatus.approved", "==", true)
      .get();
    if (familyProfiles.empty) {
      throw new Error("No family profiles exist for this specific drive ID.");
    }
    return familyProfiles.docs.map((doc) => doc.data());
  });

export const getApprovedProfileTableRows = createServerFn({
  method: "GET",
})
  .inputValidator(childParamSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const rows = [];
    const families = await getAllApprovedFamilyProfilesForDrive({ data });

    for (const family of families) {
      const eachFamChildren = await db.children
        .where("familyId", "==", family.id)
        .get();
      const childrenData = eachFamChildren.docs.map((doc) => doc.data());
      for (const child of childrenData) {
        const eachChildGifts = await db.gifts
          .where("childId", "==", child.id)
          .get();
        const gifts = eachChildGifts.docs.map((doc) => doc.data());
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
            ["CLAIMED", "PURCHASED", "DELIVERED", "RECEIVED"].includes(
              g.status,
            ),
          ).length,
          giftsTotal: gifts.length,
        };
        rows.push(row);
      }
    }
    return rows;
  });

export const getChildProfilesForFamily = createServerFn({ method: "GET" })
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
  .handler(async ({ data }) => {
    const { childId } = data;

    const db = getServerDB();
    const gifts = await db.gifts.where("childId", "==", childId).get();

    if (gifts.empty) {
      return [];
    }

    return gifts.docs.map((doc) => doc.data());
  });
