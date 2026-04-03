import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { Gift, GiftStatus } from "../../common/src/index.ts";

const familyPublicNotes = [
  "Favorite colors are blue and green.",
  "Travel-size or easy-to-store gifts are especially helpful.",
  "The family prefers creative or screen-free activities when possible.",
] as const;

export type GenerateGiftOptions = {
  childId: string;
  familyId: string;
  giftDriveId: string;
  status: GiftStatus;
  donorId?: string;
  backup?: boolean;
  active?: boolean;
};

export function generateGift({
  childId,
  familyId,
  giftDriveId,
  status,
  donorId,
  backup = false,
  active = true,
}: GenerateGiftOptions): Gift {
  return {
    id: uuidv7(),
    childId,
    familyId,
    giftDrive: giftDriveId,
    title: faker.commerce.productName(),
    productUrl: faker.internet.url(),
    listedPrice: Number(faker.commerce.price({ min: 10, max: 125, dec: 2 })),
    status,
    claimedByDonorId: status === "AVAILABLE" ? undefined : donorId,
    createdAt: faker.date.recent({ days: 21 }).toISOString(),
    familyPublicNotes: faker.datatype.boolean({ probability: 0.2 })
      ? faker.helpers.arrayElement(familyPublicNotes)
      : undefined,
    privateNotes: backup
      ? "Backup gift option if the primary wishlist items are already covered."
      : undefined,
    backup,
    active,
  };
}
