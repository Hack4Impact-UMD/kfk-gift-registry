import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { UserRole } from "common";
import { getFamilyLinkById } from "../services/familyLinkService.server";
import { getServerDB } from "@/lib/firebase.server";
import { requireRolesMiddleware } from "../middleware/authMiddleware";

const tokenInputSchema = z.object({
  token: z.string().min(1),
});

const familyIdInputSchema = z.object({
  familyId: z.string().min(1),
});

const updateFamilySchema = z.object({
  familyId: z.string().min(1),
  updates: z
    .object({
      contactName: z.string().trim().min(1).max(100),
      email: z.email(),
      phone: z.string().min(1),
      address: z
        .object({
          street: z.string().min(1),
          addressLine2: z.string().optional(),
          city: z.string().min(1),
          state: z.string().min(1),
          zipCode: z.string().min(1),
        })
        .partial(),
      privateNotes: z.string().trim().max(2000),
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
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

    const familyData = familyDoc.data()!;

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
    return updatedFamily.data()!;
  });
