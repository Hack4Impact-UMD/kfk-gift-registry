import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { Claim, GiftStatus } from "../../common/src/index.ts";

type ClaimableGiftStatus = Exclude<GiftStatus, "AVAILABLE">;

const claimPrivateNotes = [
  "Donor asked to be contacted if the wishlist changes.",
  "Family confirmed this item is still needed.",
  "Staff should follow up if delivery has not arrived by the expected date.",
] as const;

type GenerateClaimOptions = {
  giftId: string;
  childId: string;
  donorId: string;
  giftStatus: ClaimableGiftStatus;
  createdAfter?: Date;
};

function betweenOrNow(from: Date, to: Date) {
  return from.getTime() >= to.getTime()
    ? new Date(to)
    : faker.date.between({ from, to });
}

export function generateClaim({
  giftId,
  childId,
  donorId,
  giftStatus,
  createdAfter,
}: GenerateClaimOptions): Claim {
  const id = uuidv7();
  const now = new Date();
  const claimedAt = createdAfter
    ? betweenOrNow(createdAfter, now)
    : faker.date.recent({ days: 14, refDate: now });
  const purchaseDate =
    giftStatus === "PURCHASED" ||
    giftStatus === "DELIVERED" ||
    giftStatus === "RECEIVED"
      ? betweenOrNow(claimedAt, now)
      : undefined;
  const expectedDeliveryDate =
    giftStatus === "CLAIMED"
      ? faker.date.soon({ days: 10, refDate: claimedAt })
      : giftStatus === "PURCHASED" && purchaseDate
        ? faker.date.soon({ days: 7, refDate: purchaseDate })
        : purchaseDate
          ? betweenOrNow(purchaseDate, now)
          : undefined;
  const deliveryDate =
    giftStatus === "DELIVERED" || giftStatus === "RECEIVED"
      ? betweenOrNow(expectedDeliveryDate ?? purchaseDate ?? claimedAt, now)
      : undefined;

  return {
    id,
    giftId,
    childId,
    donorId,
    organizationName: faker.datatype.boolean({ probability: 0.2 })
      ? faker.company.name()
      : undefined,
    claimedAt: claimedAt.toISOString(),
    purchaseConfirmation: purchaseDate
      ? {
          date: purchaseDate.toISOString(),
          documentationUrl: `https://example.com/receipts/${id}.pdf`,
          verified: faker.datatype.boolean({ probability: 0.85 }),
          trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
        }
      : undefined,
    deliveryConfirmed: deliveryDate
      ? {
          date: deliveryDate.toISOString(),
          documentationUrl: `https://example.com/delivery/${id}.jpg`,
          verified: true,
        }
      : undefined,
    privateNotes: faker.datatype.boolean({ probability: 0.15 })
      ? faker.helpers.arrayElement(claimPrivateNotes)
      : undefined,
    expectedDeliveryDate: expectedDeliveryDate?.toISOString(),
    active: true,
  };
}
