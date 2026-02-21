import { randomBytes } from "node:crypto";
import type { FamilyLink, NoId } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { FAMILY_LINK_COLLECTION } from "@/data/collections";

const LINK_ID_SIZE = 16;

export async function getFamilyLinkById(id: string) {
  const db = getServerDB();

  const link = await db.collection(FAMILY_LINK_COLLECTION).doc(id).get();

  if (link.exists) {
    return link.data() as FamilyLink;
  } else {
    return null;
  }
}

export async function updateFamilyLink(id: string, update: Partial<NoId<FamilyLink>>) {
  const db = getServerDB();
  const doc = db.collection(FAMILY_LINK_COLLECTION).doc(id);

  await doc.update(update);
}

export async function createFamilyLink(link: NoId<FamilyLink>) {
  const db = getServerDB();
  const id = randomBytes(LINK_ID_SIZE).toString("base64url");

  const linkDoc: FamilyLink = {
    id,
    ...link
  }

  await db.collection(FAMILY_LINK_COLLECTION).doc(id).set(linkDoc);
}
