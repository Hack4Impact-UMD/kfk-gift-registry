import { v7 as uuidv7 } from "uuid";
import { deriveDefaultTreatmentLevel } from "common";
import type { Child, Gift } from "common";
import { isSiblingChildStatus } from "@/lib/formSchemas";
import type { ChildInfo } from "@/lib/formSchemas";
import type { ChildGiftSelectionInput } from "@/server/functions/familyForm";

type ChildDocInput = Pick<
  ChildInfo,
  | "name"
  | "age"
  | "status"
  | "diagnosis"
  | "hospitalTreatedAt"
  | "socialWorkerName"
  | "blurb"
>;

type GiftInput = ChildGiftSelectionInput["gifts"][number];

type DocContext = {
  familyId: string;
  giftDriveId: string;
  now: string;
};

function hasGiftIdentity<T extends GiftInput>(
  gift: T,
): gift is T & { giftName: string; giftUrl: string } {
  return Boolean(gift.giftName && gift.giftUrl);
}

export function buildChildDoc({
  id,
  child,
  familyId,
  giftDriveId,
  now,
}: DocContext & { id: string; child: ChildDocInput }): Child {
  return {
    id,
    name: child.name,
    age: parseInt(child.age, 10),
    status: child.status,
    category: isSiblingChildStatus(child.status) ? "super_sib" : "warrior",
    treatmentLevel: deriveDefaultTreatmentLevel(child.status),
    familyId,
    diagnosis: child.diagnosis ?? "",
    hospital: child.hospitalTreatedAt ?? "",
    childSocialWorker: child.socialWorkerName ?? "",
    giftDrive: giftDriveId,
    livesAtHome: true,
    publicBlurb: child.blurb,
    createdAt: now,
    published: false,
  };
}

// Blank optional gift rows are skipped.
export function buildGiftDocs({
  selection,
  childId,
  familyId,
  giftDriveId,
  now,
}: DocContext & {
  selection: ChildGiftSelectionInput;
  childId: string;
}): Array<Gift> {
  const toGift = (
    g: GiftInput & { giftName: string; giftUrl: string },
    backup: boolean,
  ): Gift => ({
    id: uuidv7(),
    childId,
    familyId,
    giftDrive: giftDriveId,
    title: g.giftName,
    productUrl: g.giftUrl,
    listedPrice: g.listedPrice,
    status: "AVAILABLE",
    backup,
    active: true,
    createdAt: now,
    familyPublicNotes: g.familyPublicNotes,
  });

  return [
    ...selection.gifts.filter(hasGiftIdentity).map((g) => toGift(g, false)),
    ...selection.backupGifts
      .filter(hasGiftIdentity)
      .map((g) => toGift(g, true)),
  ];
}
