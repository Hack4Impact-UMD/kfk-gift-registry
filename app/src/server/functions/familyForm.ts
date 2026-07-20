import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";
import { FamilyPortalEmail } from "transactional";
import z from "zod";
import { v7 as uuidv7 } from "uuid";
import { getServerDB } from "@/lib/firebase.server";
import { createFamilyLink } from "@/server/services/familyLinkService.server";
import { appCheckMiddleware } from "@/server/middleware/appCheckMiddleware";
import { DateTime } from "luxon";
import type { Family, Child, Gift } from "common";
import {
  AMAZON_PRODUCT_URL_INVALID_MESSAGE,
  AddressSchema,
  ChildStatusSchema,
  GiftFamilyPublicNotesSchema,
  GIFT_PRICE_INVALID_MESSAGE,
  GIFT_TITLE_REQUIRED_MESSAGE,
  MAX_GIFT_PRICE,
  NormalizedGiftTitleSchema,
  isValidAmazonProductUrl,
} from "common";
import { getDownloadURL } from "firebase-admin/storage";
import admin from "firebase-admin";

export const DUPLICATE_FAMILY_EMAIL_MESSAGE =
  "An account with this email already exists. If you need to modify or resubmit, contact KFK directly.";
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

const PRICE_REQUIRED_MESSAGE = "Price is required";
const URL_REQUIRED_MESSAGE = "URL is required";

const baseGiftSelectionSchema = z.object({
  giftUrl: z.url().optional().or(z.literal("")),
  giftName: NormalizedGiftTitleSchema.optional(),
  listedPrice: z.number().min(0).max(MAX_GIFT_PRICE).optional(),
  familyPublicNotes: GiftFamilyPublicNotesSchema.optional(),
});

const optionalGiftSelectionSchema = baseGiftSelectionSchema.superRefine(
  (data, ctx) => {
    const hasName = Boolean(data.giftName);
    const hasUrl = Boolean(data.giftUrl);
    const hasPrice = data.listedPrice !== undefined;
    const isBlank = !hasName && !hasUrl && !hasPrice;

    if (isBlank) return;

    if (!hasName) {
      ctx.addIssue({
        code: "custom",
        path: ["giftName"],
        message: "Gift name is required.",
      });
    }

    if (!hasUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["giftUrl"],
        message: URL_REQUIRED_MESSAGE,
      });
    } else if (!isValidAmazonProductUrl(data.giftUrl ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["giftUrl"],
        message: AMAZON_PRODUCT_URL_INVALID_MESSAGE,
      });
    }

    if (!hasPrice) {
      ctx.addIssue({
        code: "custom",
        path: ["listedPrice"],
        message: PRICE_REQUIRED_MESSAGE,
      });
      return;
    }

    const listedPrice = data.listedPrice;
    if (listedPrice === undefined) return;
    if (listedPrice < 0 || listedPrice > MAX_GIFT_PRICE) {
      ctx.addIssue({
        code: "custom",
        path: ["listedPrice"],
        message: GIFT_PRICE_INVALID_MESSAGE,
      });
    }
  },
);

const requiredGiftSelectionSchema = baseGiftSelectionSchema.superRefine(
  (data, ctx) => {
    if (!data.giftName) {
      ctx.addIssue({
        code: "custom",
        path: ["giftName"],
        message: GIFT_TITLE_REQUIRED_MESSAGE,
      });
    }

    if (!data.giftUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["giftUrl"],
        message: URL_REQUIRED_MESSAGE,
      });
    } else if (!isValidAmazonProductUrl(data.giftUrl ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["giftUrl"],
        message: AMAZON_PRODUCT_URL_INVALID_MESSAGE,
      });
    }

    if (data.listedPrice === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["listedPrice"],
        message: PRICE_REQUIRED_MESSAGE,
      });
      return;
    }

    if (data.listedPrice < 0 || data.listedPrice > MAX_GIFT_PRICE) {
      ctx.addIssue({
        code: "custom",
        path: ["listedPrice"],
        message: GIFT_PRICE_INVALID_MESSAGE,
      });
    }
  },
);

const childGiftSelectionSchema = z.object({
  childName: z.string(),
  gifts: z.tuple([
    requiredGiftSelectionSchema,
    optionalGiftSelectionSchema,
    optionalGiftSelectionSchema,
  ]),
  backupGifts: z.tuple([
    requiredGiftSelectionSchema,
    requiredGiftSelectionSchema,
  ]),
});

const giftsFormSchema = z.object({
  giftSelections: z.array(childGiftSelectionSchema),
});

const familyFormStateSchema = z.object({
  formLinkId: z.string(),
  generalInfo: generalInfoSchema.optional(),
  children: childrenFormSchema.optional(),
  gifts: giftsFormSchema.optional(),
  consentScreen: z.boolean().optional(),
});
const familyEmailSchema = z.object({
  email: z.email(),
});

const setChildPhotoUrlsSchema = z.object({
  childIds: z.array(z.string().min(1)),
});

export type FamilyFormInput = z.infer<typeof familyFormStateSchema>;

function hasGiftIdentity<T extends { giftName?: string; giftUrl?: string }>(
  gift: T,
): gift is T & { giftName: string; giftUrl: string } {
  return Boolean(gift.giftName && gift.giftUrl);
}

function normalizeFamilyEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAppBaseUrl() {
  const raw = process.env.APP_BASE_URL ?? "https://gifts.kissesforkyle.org";
  return raw.replace(/\/+$/, "");
}

function buildFamilyPageUrl(linkId: string) {
  return `${getAppBaseUrl()}/family/${linkId}/home`;
}

async function sendFamilyPortalEmail({
  email,
  contactName,
  linkId,
}: {
  email: string;
  contactName: string;
  linkId: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Skipping family portal email: RESEND_API_KEY is not set");
    return;
  }

  const familyLink = buildFamilyPageUrl(linkId);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Kisses for Kyle Gift Registry <noreply@gifts.kissesforkyle.org>",
    to: email,
    subject: "Your KFK family page link",
    react: FamilyPortalEmail({
      contactName,
      familyLink,
      baseUrl: getAppBaseUrl(),
    }),
  });

  if (error) {
    throw new Error(`${error.name} - ${error.message}`);
  }
}

async function assertFamilyEmailAvailable(email: string) {
  const db = getServerDB();
  const existingFamily = await db.families
    .where("email", "==", email)
    .limit(1)
    .get();

  if (!existingFamily.empty) {
    throw new Error(DUPLICATE_FAMILY_EMAIL_MESSAGE);
  }
}

export const checkFamilyEmailAvailability = createServerFn({ method: "POST" })
  .middleware([appCheckMiddleware])
  .inputValidator(familyEmailSchema)
  .handler(async ({ data }) => {
    await assertFamilyEmailAvailable(normalizeFamilyEmail(data.email));
    return { available: true };
  });

export const setChildPhotoUrls = createServerFn({ method: "POST" })
  .middleware([appCheckMiddleware])
  .inputValidator(setChildPhotoUrlsSchema)
  .handler(async ({ data }) => {
    const bucket = admin.storage().bucket();
    const db = getServerDB();

    const batch = db._instance.batch();
    await Promise.all(
      data.childIds.map(async (childId) => {
        const photoUrl = await getDownloadURL(
          bucket.file(`children/pfps/${childId}`),
        );
        batch.update(db.children.doc(childId), { photoUrl });
      }),
    );
    await batch.commit();
  });
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

    // Resolve the gift drive from the form link doc. The drive ID is never
    // trusted from the client — it is read from the link, which must exist and
    // be active for submissions to proceed.
    const formLink = (await db.formLinks.doc(data.formLinkId).get()).data();
    if (!formLink) throw new Error("Form link not found");
    if (!formLink.active) {
      throw new Error("This registration link is no longer active.");
    }
    const giftDriveId = formLink.driveId;
    const giftDriveDoc = await db.giftDrives.doc(giftDriveId).get();
    if (!giftDriveDoc.exists) {
      throw new Error("This registration link is misconfigured.");
    }

    const now = DateTime.now().toISO();
    const normalizedEmail = normalizeFamilyEmail(data.generalInfo.email);

    // Pre-generate IDs so photos can be stored under the correct child path
    // before the Firestore transaction runs.
    const familyId = uuidv7();
    const childIds = data.children.children.map(() => uuidv7());

    // Build documents
    const family: Family = {
      id: familyId,
      contactName: data.generalInfo.parentName,
      guardianRelationship: "",
      email: normalizedEmail,
      phone: data.generalInfo.phoneNumber,
      address: data.generalInfo.address,
      privateNotes: data.children.additionalNotes,
      giftDrive: giftDriveId,
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
        giftDrive: giftDriveId,
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
          .filter(hasGiftIdentity)
          .map((g): Gift => {
            const { giftName, giftUrl } = g;
            if (!giftName || !giftUrl) {
              throw new Error("Gift selections must include both name and URL");
            }

            return {
              id: uuidv7(),
              childId,
              familyId,
              giftDrive: giftDriveId,
              title: giftName,
              productUrl: giftUrl,
              listedPrice: g.listedPrice,
              status: "AVAILABLE",
              backup: false,
              active: true,
              createdAt: now,
              familyPublicNotes: g.familyPublicNotes,
            };
          });

        const backup = selection.backupGifts
          .filter(hasGiftIdentity)
          .map((g): Gift => {
            const { giftName, giftUrl } = g;
            if (!giftName || !giftUrl) {
              throw new Error("Gift selections must include both name and URL");
            }

            return {
              id: uuidv7(),
              childId,
              familyId,
              giftDrive: giftDriveId,
              title: giftName,
              productUrl: giftUrl,
              listedPrice: g.listedPrice,
              status: "AVAILABLE",
              backup: true,
              active: true,
              createdAt: now,
              familyPublicNotes: g.familyPublicNotes,
            };
          });

        return [...regular, ...backup];
      },
    );

    // Single atomic Firestore transaction — all documents created together.
    await db._instance.runTransaction(async (tx) => {
      const existingFamily = await tx.get(
        db.families.where("email", "==", normalizedEmail).limit(1),
      );

      if (!existingFamily.empty) {
        throw new Error(DUPLICATE_FAMILY_EMAIL_MESSAGE);
      }

      tx.set(db.families.doc(familyId), family);
      childDocs.forEach((child) => tx.set(db.children.doc(child.id), child));
      giftDocs.forEach((gift) => tx.set(db.gifts.doc(gift.id), gift));
    });

    const link = await createFamilyLink({ familyId, active: true });

    void sendFamilyPortalEmail({
      email: normalizedEmail,
      contactName: family.contactName,
      linkId: link.id,
    }).catch((error) => {
      console.error("Family portal email failed to send", error);
    });

    return {
      link,
      childIds,
    };
  });

export default submitFamilyForm;
