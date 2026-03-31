import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { v7 as uuidv7 } from "uuid";
import admin from "firebase-admin";
import { getServerDB } from "@/lib/firebase.server";
import { createFamilyLink } from "@/server/services/familyLinkService.server";
import { DateTime } from "luxon";
import type { Family, Child, ChildStatus, Gift } from "common";

// --- Photo upload constants ---

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
type AllowedMimeType = (typeof ALLOWED_PHOTO_MIME_TYPES)[number];
const MIME_TO_EXT: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// ChildStatus values — must stay in sync with common/src/types/child.ts
const CHILD_STATUS_VALUES = [
  "recently_diagnosed_relapse",
  "diagnosed_in_treatment_1yr+",
  "recently_off_treatment",
  "off_treatment_1yr+",
  "sibling_in_treatment",
  "bereaved_sibling",
] as const satisfies ReadonlyArray<ChildStatus>;

// --- Zod schemas ---

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
});

const childStatusSchema = z.enum(CHILD_STATUS_VALUES);

const childInfoSchema = z.object({
  name: z.string(),
  age: z.string(),
  diagnosis: z.string().optional(),
  hospitalTreatedAt: z.string().optional(),
  socialWorkerName: z.string().optional(),
  photoUrl: z.string().optional(),
  status: childStatusSchema,
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
  giftUrl: z.url().optional().or(z.string("")),
  giftName: z.string().optional(),
  familyPublicNotes: z.string().optional(),
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

// --- Photo upload ---
// Uploads a data URL to GCS via the Admin SDK and returns a permanent public URL.
// Write access is admin-SDK-only; the object is made publicly readable for display.

async function uploadChildPhoto(
  childId: string,
  dataUrl: string,
): Promise<string> {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx === -1) throw new Error("Invalid photo data URL");

  const header = dataUrl.slice(0, commaIdx);
  const base64Data = dataUrl.slice(commaIdx + 1);
  const mimeType = header.match(/data:([^;]+);/)?.[1];

  if (
    !mimeType ||
    !(ALLOWED_PHOTO_MIME_TYPES as ReadonlyArray<string>).includes(mimeType)
  ) {
    throw new Error(`Unsupported photo type: ${mimeType ?? "unknown"}`);
  }

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.byteLength > MAX_PHOTO_SIZE_BYTES) {
    throw new Error(`Photo exceeds the 5 MB size limit`);
  }

  const ext = MIME_TO_EXT[mimeType as AllowedMimeType];
  const bucket = admin.storage().bucket();
  const file = bucket.file(`children/pfps/${childId}.${ext}`);

  await file.save(buffer, { metadata: { contentType: mimeType } });
  await file.makePublic();

  return file.publicUrl();
}

//TODO: rate limit
export const submitFamilyForm = createServerFn({ method: "POST" })
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

    // Upload photos outside the Firestore transaction — GCS operations can't
    // participate in a Firestore transaction.
    const childPhotoUrls = new Map<number, string>();
    for (let i = 0; i < data.children.children.length; i++) {
      const photoUrl = data.children.children[i].photoUrl;
      if (photoUrl?.startsWith("data:")) {
        childPhotoUrls.set(i, await uploadChildPhoto(childIds[i], photoUrl));
      } else if (photoUrl) {
        childPhotoUrls.set(i, photoUrl);
      }
    }

    // Build documents
    const family: Family = {
      id: familyId,
      contactName: data.generalInfo.parentName,
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
        photoUrl: childPhotoUrls.get(i),
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
          .filter((g) => g.giftName && g.giftUrl)
          .map(
            (g): Gift => ({
              id: uuidv7(),
              childId,
              familyId,
              giftDrive: data.giftDriveId,
              title: g.giftName!,
              productUrl: g.giftUrl!,
              status: "AVAILABLE",
              backup: false,
              active: true,
              createdAt: now,
              familyPublicNotes: g.familyPublicNotes,
            }),
          );

        const backup = (selection.backupGifts ?? [])
          .filter((g) => g.giftName && g.giftUrl)
          .map(
            (g): Gift => ({
              id: uuidv7(),
              childId,
              familyId,
              giftDrive: data.giftDriveId,
              title: g.giftName!,
              productUrl: g.giftUrl!,
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

    return createFamilyLink({ familyId, active: true });
  });

export default submitFamilyForm;
