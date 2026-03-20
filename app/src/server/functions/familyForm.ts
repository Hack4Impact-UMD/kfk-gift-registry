import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getServerDB } from "@/lib/firebase.server";
import { DateTime } from "luxon";
import type { Family, Child } from "common";

const addressSchema = z.object({
  street: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
});

const generalInfoSchema = z.object({
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: addressSchema,
  privateNotes: z.string().optional(),
});

const childInfoSchema = z.object({
  name: z.string(),
  age: z.string(),
  diagnosis: z.string().optional(),
  hospitalTreatedAt: z.string().optional(),
  socialWorkerName: z.string().optional(),
  photoUrl: z.string().optional(),
  status: z.string(),
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
  giftUrl: z.string().url().optional(),
  giftName: z.string().optional(),
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

export type FamilyFormInput = z.infer<typeof familyFormStateSchema>; // just extracts the ts type based on zod schema

export default createServerFn({ method: "POST" })
  .inputValidator(familyFormStateSchema)
  .handler(async ({ data }) => {
    const formData = data as FamilyFormInput;

    if (!formData.generalInfo) throw new Error("General information is required");
    if (!formData.children?.children.length) throw new Error("At least one child is required");
    if (!formData.gifts?.giftSelections.length) throw new Error("Gift selections are required");

    const db = getServerDB();
    const giftDriveId = formData.giftDriveId; // making it as input for now (dont know if there's a preset)

    const familyId = db.families.doc().id;
    const now = DateTime.now().toISO();

    const family: Family = {
      id: familyId,
      contactName: formData.generalInfo.contactName,
      email: formData.generalInfo.email,
      phone: formData.generalInfo.phone,
      address: formData.generalInfo.address,
      privateNotes: formData.generalInfo.privateNotes,
      giftDrive: giftDriveId,
      createdAt: now,
    };

    const childDocs: Child[] = formData.children.children.map((childForm) => {
      const childId = db.children.doc().id;
      return {
        id: childId,
        name: childForm.name,
        age: parseInt(childForm.age, 10),
        status: childForm.status as any,
        category: childForm.isSibling ? "super_sib" : "warrior",
        familyId,
        diagnosis: childForm.diagnosis || "",
        hospital: childForm.hospitalTreatedAt || "",
        childSocialWorker: childForm.socialWorkerName || "",
        photoUrl: childForm.photoUrl,
        giftDrive: giftDriveId,
        livesAtHome: true,
        publicBlurb: childForm.blurb,
        reviewStatus: { approved: false },
        createdAt: now,
      };
    });

    try {
      await db._instance.runTransaction(async (tx) => {
        tx.set(db.families.doc(familyId), family);
        childDocs.forEach((child) => {
          tx.set(db.children.doc(child.id), child);
        });
      });
    } catch (err) {
      throw new Error("Failed to create family and children");
    }

    // TODO: Implement gift document creation (Commit 3)
    // TODO: Implement family link generation (Commit 4)

    throw new Error("NOT YET IMPLEMENTED");
  }
);