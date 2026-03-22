import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { v7 as uuidv7 } from "uuid";
import admin from "firebase-admin";
import { getServerDB } from "@/lib/firebase.server";
import { createFamilyLink } from "@/server/services/familyLinkService.server";
import { DateTime } from "luxon";
import type { Family, Child, ChildStatus, Gift } from "common";

const addressSchema = z.object({
  street: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
});

const generalInfoSchema = z.object({
  parentName: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
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
  giftUrl: z.url().optional(),
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

    if (!formData.generalInfo)
      throw new Error("General information is required");
    if (!formData.children?.children.length)
      throw new Error("At least one child is required");
    if (!formData.gifts?.giftSelections.length)
      throw new Error("Gift selections are required");

    const db = getServerDB();
    const familyId = uuidv7();
    const now = DateTime.now().toISO();

    const family: Family = {
      id: familyId,
      contactName: formData.generalInfo.parentName,
      email: formData.generalInfo.email,
      phone: formData.generalInfo.phoneNumber,
      address: formData.generalInfo.address,
      privateNotes: formData.generalInfo.privateNotes,
      giftDrive: formData.giftDriveId,
      createdAt: now,
      reviewStatus: {
        approved: false,
        held: false,
      }
    };

    const childDocs: Array<Child> = formData.children.children.map(
      (childForm) => {
        const childId = uuidv7();
        return {
          id: childId,
          name: childForm.name,
          age: parseInt(childForm.age, 10),
          status: childForm.status as ChildStatus,
          category: childForm.isSibling ? "super_sib" : "warrior",
          familyId,
          diagnosis: childForm.diagnosis || "",
          hospital: childForm.hospitalTreatedAt || "",
          childSocialWorker: childForm.socialWorkerName || "",
          photoUrl: childForm.photoUrl,
          giftDrive: formData.giftDriveId,
          livesAtHome: true,
          publicBlurb: childForm.blurb,
          reviewStatus: { approved: false },
          createdAt: now,
          published: false // families get published in the commit + review page, until then keep the children unpublished
        };
      },
    );

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

    // Create gift documents
    const giftDocs: Array<Gift> = [];
    const childMap = new Map<string, string>();
    childDocs.forEach((child) => {
      const formChild = formData.children!.children.find(
        (c) => c.name === child.name,
      );
      if (formChild) {
        childMap.set(formChild.name, child.id);
      }
    });

    formData.gifts!.giftSelections.forEach((selection) => {
      const childId = childMap.get(selection.childName);
      if (!childId) {
        throw new Error(`Child not found: ${selection.childName}`);
      }

      // Add regular gifts
      selection.gifts.forEach((gift) => {
        if (gift.giftName && gift.giftUrl) {
          giftDocs.push({
            id: uuidv7(),
            childId,
            familyId,
            giftDrive: formData.giftDriveId,
            title: gift.giftName,
            productUrl: gift.giftUrl,
            status: "AVAILABLE",
            backup: false,
            active: true,
            createdAt: now,
          });
        }
      });

      // Add backup gifts
      if (selection.backupGifts) {
        selection.backupGifts.forEach((gift) => {
          if (gift.giftName && gift.giftUrl) {
            giftDocs.push({
              id: uuidv7(),
              childId,
              familyId,
              giftDrive: formData.giftDriveId,
              title: gift.giftName,
              productUrl: gift.giftUrl,
              status: "AVAILABLE",
              backup: true,
              active: true,
              createdAt: now,
            });
          }
        });
      }
    });

    // upload child profile pictures to GCS
    const childPhotoUpdates: Array<{ childId: string; photoUrl: string }> = [];
    for (const child of childDocs) {
      const formChild = formData.children!.children.find(
        (c) => c.name === child.name,
      );
      if (formChild?.photoUrl && formChild.photoUrl.startsWith("data:")) {
        // convert data URL to buffer and upload to GCS
        try {
          const base64Data = formChild.photoUrl.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");

          // determine file extension from data URL
          const mimeType = formChild.photoUrl.split(":")[1]?.split(";")[0];
          const ext = mimeType === "image/png" ? "png" : "jpg";

          const bucket = admin.storage().bucket();
          const file = bucket.file(`children/pfps/${child.id}.${ext}`);

          await file.save(buffer, {
            metadata: {
              contentType: mimeType || "image/jpeg",
            },
          });

          // get public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/children/pfps/${child.id}.${ext}`;
          childPhotoUpdates.push({
            childId: child.id,
            photoUrl: publicUrl,
          });
        } catch (err) {
          console.error(`Failed to upload photo for child ${child.id}:`, err);
          // Continue without photo instead of just failing everything about the submission
        }
      } else if (formChild?.photoUrl) {
        // alr URL, keep it the same
        childPhotoUpdates.push({
          childId: child.id,
          photoUrl: formChild.photoUrl,
        });
      }
    }

    // Update children with final photo URLs
    if (childPhotoUpdates.length > 0) {
      try {
        await db._instance.runTransaction(async (tx) => {
          childPhotoUpdates.forEach((update) => {
            tx.update(db.children.doc(update.childId), {
              photoUrl: update.photoUrl,
            });
          });
        });
      } catch (err) {
        console.error("Failed to update child photos", err);
      }
    }

    
    try {
      await db._instance.runTransaction(async (tx) => {
        giftDocs.forEach((gift) => {
          tx.set(db.gifts.doc(gift.id), gift);
        });
      });
    } catch (err) {
      throw new Error("Failed to create gifts");
    }

    // Generate family link
    const familyLink = await createFamilyLink({
      familyId,
      active: true,
    });

    return familyLink;
  });
