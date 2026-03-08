import { randomBytes } from "node:crypto";
import type { FamilyLink, NoId } from "common";
import { getServerDB } from "@/lib/firebase.server";

const LINK_ID_SIZE = 16;

export async function getFamilyLinkById(id: string) {
  const db = getServerDB();

  const link = await db.familyLinks.doc(id).get();

  if (link.exists) {
    return link.data() ?? null;
  } else {
    return null;
  }
}

export async function updateFamilyLink(
  id: string,
  update: Partial<NoId<FamilyLink>>,
) {
  const db = getServerDB();
  const doc = db.familyLinks.doc(id);

  await doc.update(update);
}

export async function createFamilyLink(link: NoId<FamilyLink>) {
  const db = getServerDB();
  const id = randomBytes(LINK_ID_SIZE).toString("base64url");

  const linkDoc: FamilyLink = {
    id,
    ...link,
  };
  await db.familyLinks.doc(id).set(linkDoc);
}

export async function getFamilyLinkFromEmail(email: string) {
  const db = getServerDB();

  // Query the family by email
  const familyQuery = await db.families.where("email", "==", email).limit(1).get();

  if (familyQuery.empty) {
    return null;
  }

  const family = familyQuery.docs[0].data();

  // Return an active family link if one exists
  const linkQuery = await db.familyLinks
    .where("familyId", "==", family.id)
    .where("active", "==", true)
    .limit(1)
    .get();

  if (linkQuery.empty) {
    return null;
  }

  return linkQuery.docs[0].data();
}
