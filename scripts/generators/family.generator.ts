import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { Family } from "../../common/src/index.ts";

const familyPrivateNotes = [
  "Family asked for a short follow-up call before the profile is published.",
  "Staff is waiting on one more document before the review can be finalized.",
  "Intake notes indicate the family may need an updated contact confirmation.",
] as const;

export function generateFamily(
  giftDriveId: string,
  reviewerIds: ReadonlyArray<string>,
): Family {
  const createdAt = faker.date.recent({ days: 45 }).toISOString();
  const approved = faker.datatype.boolean({ probability: 0.72 });
  const held = !approved && faker.datatype.boolean({ probability: 0.35 });

  const reviewStatus: Family["reviewStatus"] = approved
    ? {
        approved: true,
        held: false,
        lastReviewedAt: faker.date
          .between({ from: new Date(createdAt), to: new Date() })
          .toISOString(),
        reviewedBy: faker.helpers.arrayElement(reviewerIds),
        reviewNotes: faker.helpers.arrayElement([
          "Approved for storefront publishing.",
          "Family information verified by staff intake.",
          "Submission looks complete and ready to publish.",
        ]),
      }
    : held
      ? {
          approved: false,
          held: true,
          lastReviewedAt: faker.date
            .between({ from: new Date(createdAt), to: new Date() })
            .toISOString(),
          reviewedBy: faker.helpers.arrayElement(reviewerIds),
          holdNotes: faker.helpers.arrayElement([
            "Waiting on follow-up paperwork before review can continue.",
            "Staff requested clarification on submitted details.",
            "Profile is on hold pending additional family confirmation.",
          ]),
        }
      : {
          approved: false,
          held: false,
        };

  return {
    id: uuidv7(),
    contactName: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
    address: {
      street: faker.location.streetAddress(),
      addressLine2: faker.datatype.boolean({ probability: 0.2 })
        ? faker.location.secondaryAddress()
        : undefined,
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode(),
    },
    privateNotes: held
      ? faker.helpers.arrayElement(familyPrivateNotes)
      : undefined,
    giftDrive: giftDriveId,
    createdAt,
    reviewStatus,
  };
}
