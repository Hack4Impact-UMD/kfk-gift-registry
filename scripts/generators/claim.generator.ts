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

export function generateClaim({
  giftId,
  childId,
  donorId,
  giftStatus,
  createdAfter,
}: GenerateClaimOptions): Claim {
  const id = uuidv7();
  const claimedAt = createdAfter
    ? faker.date.between({ from: createdAfter, to: new Date() })
    : faker.date.recent({ days: 14 });
  const purchaseDate =
    giftStatus === "PURCHASED" ||
    giftStatus === "DELIVERED" ||
    giftStatus === "RECEIVED"
      ? faker.date.soon({ days: 3, refDate: claimedAt })
      : undefined;
  const expectedDeliveryDate =
    giftStatus === "CLAIMED"
      ? faker.date.soon({ days: 10, refDate: claimedAt })
      : purchaseDate
        ? faker.date.soon({ days: 7, refDate: purchaseDate })
        : undefined;
  const deliveryDate =
    giftStatus === "DELIVERED" || giftStatus === "RECEIVED"
      ? faker.date.soon({
          days: 3,
          refDate: expectedDeliveryDate ?? purchaseDate ?? claimedAt,
        })
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
