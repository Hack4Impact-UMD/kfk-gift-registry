import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { v7 as uuidv7 } from "uuid";
import { getServerDB } from "@/lib/firebase.server";
import { createFamilyLink } from "@/server/services/familyLinkService.server";
import { appCheckMiddleware } from "@/server/middleware/appCheckMiddleware";
import { DateTime } from "luxon";
import type { Family, Child, Gift } from "common";
import {
  AddressSchema,
  ChildStatusSchema,
  GiftFamilyPublicNotesSchema,
  NormalizedGiftTitleSchema,
} from "common";

// --- Zod schemas ---

const generalInfoSchema = z.object({
  parentName: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
  address: AddressSchema,
});

const childInfoSchema = z.object({
  name: z.string(),
  age: z.string(),
  diagnosis: z.string().optional(),
  hospitalTreatedAt: z.string().optional(),
  socialWorkerName: z.string().optional(),
  photoUrl: z.string().optional(),
  status: ChildStatusSchema,
  treatmentLength: z.string().optional(),
  blurb: z.string().optional(),
  isSibling: z.boolean().optional(),
});

const childrenFormSchema = z.object({
  numChildren: z.coerce.number(),
  children: z.array(childInfoSchema),
  additionalNotes: z.string().optional(),
  consentPhotosPublic: z.boolean(),
});

const giftSelectionSchema = z.object({
  giftUrl: z.url().optional().or(z.literal("")),
  giftName: NormalizedGiftTitleSchema.optional(),
  familyPublicNotes: GiftFamilyPublicNotesSchema.optional(),
});

const childGiftSelectionSchema = z.object({
  childName: z.string(),
  gifts: z.array(giftSelectionSchema),
  backupGifts: z.array(giftSelectionSchema).optional(),
  verified: z.boolean(),
});

const giftsFormSchema = z.object({
  giftSelections: z.array(childGiftSelectionSchema),
});

const familyFormStateSchema = z.object({
  giftDriveId: z.string(),
  generalInfo: generalInfoSchema.optional(),
  children: childrenFormSchema.optional(),
  gifts: giftsFormSchema.optional(),
  consentScreen: z.boolean().optional(),
});

export type FamilyFormInput = z.infer<typeof familyFormStateSchema>;

//TODO: rate limit
export const submitFamilyForm = createServerFn({ method: "POST" })
  .middleware([appCheckMiddleware])
  .inputValidator(familyFormStateSchema)
  .handler(async ({ data }) => {
    if (!data.generalInfo) throw new Error("General information is required");
    if (!data.children?.children.length)
      throw new Error("At least one child is required");
    if (!data.gifts?.giftSelections.length)
      throw new Error("Gift selections are required");

    const db = getServerDB();
    const now = DateTime.now().toISO();

    // Pre-generate IDs so photos can be stored under the correct child path
    // before the Firestore transaction runs.
    const familyId = uuidv7();
    const childIds = data.children.children.map(() => uuidv7());

    // Build documents
    const family: Family = {
      id: familyId,
      contactName: data.generalInfo.parentName,
      guardianRelationship: "",
      email: data.generalInfo.email,
      phone: data.generalInfo.phoneNumber,
      address: data.generalInfo.address,
      privateNotes: data.children.additionalNotes,
      giftDrive: data.giftDriveId,
      createdAt: now,
      reviewStatus: { approved: false, held: false },
    };

    // childForm.status is typed as ChildStatus here — the Zod transform above
    // maps display strings to enum values during validation.
    const childDocs: Array<Child> = data.children.children.map(
      (childForm, i) => ({
        id: childIds[i],
        name: childForm.name,
        age: parseInt(childForm.age, 10),
        status: childForm.status,
        category: childForm.isSibling ? "super_sib" : ("warrior" as const),
        familyId,
        diagnosis: childForm.diagnosis ?? "",
        hospital: childForm.hospitalTreatedAt ?? "",
        childSocialWorker: childForm.socialWorkerName ?? "",
        giftDrive: data.giftDriveId,
        livesAtHome: true,
        publicBlurb: childForm.blurb,
        createdAt: now,
        published: false,
      }),
    );

    if (childDocs.length !== data.gifts.giftSelections.length) {
      throw new Error(
        `Gift selection count (${data.gifts.giftSelections.length}) does not match child count (${childDocs.length})`,
      );
    }

    const giftDocs: Array<Gift> = data.gifts.giftSelections.flatMap(
      (selection, idx) => {
        const childId = childIds[idx];

        const regular = selection.gifts
          .filter((g): g is typeof g & { giftName: string; giftUrl: string } =>
            Boolean(g.giftName && g.giftUrl),
          )
          .map(
            (g): Gift => ({
              id: uuidv7(),
              childId,
              familyId,
              giftDrive: data.giftDriveId,
              title: g.giftName,
              productUrl: g.giftUrl,
              status: "AVAILABLE",
              backup: false,
              active: true,
              createdAt: now,
              familyPublicNotes: g.familyPublicNotes,
            }),
          );

        const backup = (selection.backupGifts ?? [])
          .filter((g): g is typeof g & { giftName: string; giftUrl: string } =>
            Boolean(g.giftName && g.giftUrl),
          )
          .map(
            (g): Gift => ({
              id: uuidv7(),
              childId,
              familyId,
              giftDrive: data.giftDriveId,
              title: g.giftName,
              productUrl: g.giftUrl,
              status: "AVAILABLE",
              backup: true,
              active: true,
              createdAt: now,
              familyPublicNotes: g.familyPublicNotes,
            }),
          );

        return [...regular, ...backup];
      },
    );

    // Single atomic Firestore transaction — all documents created together.
    await db._instance.runTransaction(async (tx) => {
      tx.set(db.families.doc(familyId), family);
      childDocs.forEach((child) => tx.set(db.children.doc(child.id), child));
      giftDocs.forEach((gift) => tx.set(db.gifts.doc(gift.id), gift));
    });

    const link = await createFamilyLink({ familyId, active: true });

    return {
      link,
      childIds,
    };
  });

export default submitFamilyForm;
