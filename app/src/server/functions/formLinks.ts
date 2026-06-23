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
