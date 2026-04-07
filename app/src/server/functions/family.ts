import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getFamilyLinkById } from "../services/familyLinkService.server";
import { getServerDB } from "@/lib/firebase.server";

const tokenInputSchema = z.object({
  token: z.string().min(1),
});

const familyIdInputSchema = z.object({
  familyId: z.string().min(1),
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
  .handler(async ({ data }) => {
    const { familyId } = data;

    const db = getServerDB();
    const familyDoc = await db.families.doc(familyId).get();

    if (!familyDoc.exists) {
      throw new Error("Family not found");
    }

    return familyDoc.data();
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

    const familyData = familyDoc.data();

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
