import { getServerDB } from "@/lib/firebase.server";
import z from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { ApprovedProfileTableRow } from "@/components/tables/ApprovedProfilesTable/types";

const childParamSchema = z.object({
  // just so it's clean for the input validator
  driveId: z.string(),
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
