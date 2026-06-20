import { createServerFn } from "@tanstack/react-start";
import { v7 as uuidv7 } from "uuid";
import { FormLinkSchema, UserRole } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";

const staffOnly = requireRolesMiddleware([
  UserRole.DIRECTOR,
  UserRole.ADMIN,
  UserRole.VOLUNTEER,
]);

export const getAllFormLinks = createServerFn().handler(async () => {
  const db = getServerDB();
  return (await db.formLinks.get()).docs.map((d) => d.data());
});

export const getFormLinkById = createServerFn()
  .inputValidator((data: { id: string }) => data.id)
  .handler(async ({ data: id }) => {
    const db = getServerDB();
    return (await db.formLinks.doc(id).get()).data();
  });

export const getStorefrontFormLink = createServerFn().handler(async () => {
  const db = getServerDB();
  const snap = await db.formLinks
    .where("showOnStorefront", "==", true)
    .where("active", "==", true)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].data();
});

async function demoteOtherStorefrontLinks(
  db: ReturnType<typeof getServerDB>,
  exceptId?: string,
) {
  const snap = await db.formLinks.where("showOnStorefront", "==", true).get();

  const batch = db._instance.batch();
  for (const doc of snap.docs) {
    if (doc.id === exceptId) continue;
    batch.update(doc.ref, { showOnStorefront: false });
  }
  await batch.commit();
}

export const createFormLink = createServerFn({ method: "POST" })
  .middleware([staffOnly])
  .inputValidator(FormLinkSchema.omit({ id: true }))
  .handler(async ({ data }) => {
    const db = getServerDB();
    if (data.showOnStorefront) {
      await demoteOtherStorefrontLinks(db);
    }
    const id = uuidv7();
    const formLink = { id, ...data };
    await db.formLinks.doc(id).set(formLink);
    return formLink;
  });

export const updateFormLink = createServerFn({ method: "POST" })
  .middleware([staffOnly])
  .inputValidator(FormLinkSchema.partial().required({ id: true }))
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { id, ...fields } = data;
    if (fields.showOnStorefront) {
      await demoteOtherStorefrontLinks(db, id);
    }
    await db.formLinks.doc(id).update(fields);
  });

export const deleteFormLink = createServerFn({ method: "POST" })
  .middleware([staffOnly])
  .inputValidator((data: { id: string }) => data.id)
  .handler(async ({ data: id }) => {
    const db = getServerDB();
    await db.formLinks.doc(id).delete();
  });
