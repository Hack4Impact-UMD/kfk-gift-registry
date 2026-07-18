import { createServerFn } from "@tanstack/react-start";
import type { GiftDrive } from "common";
import { DateTime } from "luxon";
import { v7 as uuidv7 } from "uuid";
import { FormLinkSchema, UserRole } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import { deactivateFormLinksForDrive } from "@/server/services/giftDriveService.server";

const staffOnly = requireRolesMiddleware([
  UserRole.DIRECTOR,
  UserRole.ADMIN,
  UserRole.VOLUNTEER,
]);

export const getAllFormLinks = createServerFn().handler(async () => {
  const db = getServerDB();
  const drives = (await db.giftDrives.get()).docs.map((doc) => doc.data());

  await Promise.all(
    drives
      .filter(shouldDeactivateDriveLinks)
      .map((drive) => tryDeactivateDriveLinks(db, drive.id)),
  );

  return (await db.formLinks.get()).docs.map((doc) => doc.data());
});

export const getFormLinkById = createServerFn()
  .inputValidator((data: { id: string }) => data.id)
  .handler(async ({ data: id }) => {
    const db = getServerDB();
    const formLink = (await db.formLinks.doc(id).get()).data();
    if (!formLink) return undefined;

    const drive = (await db.giftDrives.doc(formLink.driveId).get()).data();
    if (drive && shouldDeactivateDriveLinks(drive)) {
      await tryDeactivateDriveLinks(db, drive.id);
      return (await db.formLinks.doc(id).get()).data();
    }

    return formLink;
  });

export const getStorefrontFormLink = createServerFn().handler(async () => {
  const db = getServerDB();
  const snap = await db.formLinks
    .where("showOnStorefront", "==", true)
    .where("active", "==", true)
    .get();

  if (snap.empty) return null;

  const drivesToDeactivate = new Set<string>();
  let validLink: ReturnType<(typeof snap.docs)[number]["data"]> | null = null;
  for (const doc of snap.docs) {
    const link = doc.data();
    const drive = (await db.giftDrives.doc(link.driveId).get()).data();
    if (drive && shouldDeactivateDriveLinks(drive)) {
      drivesToDeactivate.add(drive.id);
      continue;
    }

    validLink ??= link;
  }

  if (drivesToDeactivate.size > 0) {
    await Promise.all(
      [...drivesToDeactivate].map((driveId) =>
        tryDeactivateDriveLinks(db, driveId),
      ),
    );

    if (validLink) return validLink;

    const refreshed = await db.formLinks
      .where("showOnStorefront", "==", true)
      .where("active", "==", true)
      .limit(1)
      .get();

    return refreshed.empty ? null : refreshed.docs[0].data();
  }

  return validLink;
});

function shouldDeactivateDriveLinks(drive: GiftDrive) {
  if (drive.formLinksDeactivatedAt) {
    return false;
  }

  const end = DateTime.fromISO(drive.endDate, { zone: "utc" });
  return end.isValid && end < DateTime.utc();
}

async function tryDeactivateDriveLinks(
  db: ReturnType<typeof getServerDB>,
  driveId: string,
) {
  try {
    await db._instance.runTransaction((tx) =>
      deactivateFormLinksForDrive(tx, driveId),
    );
  } catch (error) {
    console.error(
      `Failed to deactivate form links for drive ${driveId}`,
      error,
    );
  }
}

async function demoteOtherStorefrontLinks(
  db: ReturnType<typeof getServerDB>,
  tx: FirebaseFirestore.Transaction,
  exceptId?: string,
) {
  const snap = await tx.get(db.formLinks.where("showOnStorefront", "==", true));

  for (const doc of snap.docs) {
    if (doc.id === exceptId) continue;
    tx.update(doc.ref, { showOnStorefront: false });
  }
}

export const createFormLink = createServerFn({ method: "POST" })
  .middleware([staffOnly])
  .inputValidator(FormLinkSchema.omit({ id: true }))
  .handler(async ({ data }) => {
    const db = getServerDB();
    return await db._instance.runTransaction(async (tx) => {
      if (data.showOnStorefront) {
        await demoteOtherStorefrontLinks(db, tx);
      }
      const id = uuidv7();
      const formLink = { id, ...data };
      tx.set(db.formLinks.doc(id), formLink);
      return formLink;
    });
  });

export const updateFormLink = createServerFn({ method: "POST" })
  .middleware([staffOnly])
  .inputValidator(FormLinkSchema.partial().required({ id: true }))
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { id, ...fields } = data;

    await db._instance.runTransaction(async (tx) => {
      if (fields.showOnStorefront) {
        await demoteOtherStorefrontLinks(db, tx, id);
      }
      tx.update(db.formLinks.doc(id), fields);
    });
  });

export const deleteFormLink = createServerFn({ method: "POST" })
  .middleware([staffOnly])
  .inputValidator((data: { id: string }) => data.id)
  .handler(async ({ data: id }) => {
    const db = getServerDB();
    await db.formLinks.doc(id).delete();
  });
