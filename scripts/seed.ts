import { faker } from "@faker-js/faker";
import {
  UserRole,
  type Claim,
  type Child,
  type Family,
  type FamilyLink,
  type Gift,
  type GiftStatus,
  type StaffInvite,
  type UserProfile,
} from "../common/src/index.ts";
import { generateChild } from "./generators/child.generator.ts";
import { generateClaim } from "./generators/claim.generator.ts";
import { generateFamily } from "./generators/family.generator.ts";
import { generateFamilyLink } from "./generators/family-link.generator.ts";
import { generateGiftDrive } from "./generators/gift-drive.generator.ts";
import { generateGift } from "./generators/gift.generator.ts";
import { generateInvite } from "./generators/invite.generator.ts";
import { generateUser } from "./generators/user.generator.ts";

type Args = {
  families: number;
  children: number;
  gifts: number;
  seed: number;
};

type NonEmptyArray<T> = [T, ...Array<T>];

const defaults: Args = {
  families: 5,
  children: 2,
  gifts: 4,
  seed: 42,
};

function parseIntegerArg(
  args: Array<string>,
  name: keyof Args,
  fallback: number,
): number {
  const flag = `--${name}`;

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];

    if (current === flag) {
      const next = args[i + 1];
      if (!next) {
        throw new Error(`Missing value for ${flag}`);
      }

      return parseRequiredInteger(next, flag);
    }

    if (current.startsWith(`${flag}=`)) {
      return parseRequiredInteger(current.slice(flag.length + 1), flag);
    }
  }

  return fallback;
}

function parseRequiredInteger(rawValue: string, flag: string): number {
  const value = Number.parseInt(rawValue, 10);

  if (Number.isNaN(value) || value < 0) {
    throw new Error(`${flag} must be a non-negative integer`);
  }

  return value;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);

  return {
    families: parseIntegerArg(args, "families", defaults.families),
    children: parseIntegerArg(args, "children", defaults.children),
    gifts: parseIntegerArg(args, "gifts", defaults.gifts),
    seed: parseIntegerArg(args, "seed", defaults.seed),
  };
}

function pickGiftStatus(): GiftStatus {
  return faker.helpers.weightedArrayElement([
    { value: "AVAILABLE", weight: 58 },
    { value: "CLAIMED", weight: 17 },
    { value: "PURCHASED", weight: 14 },
    { value: "DELIVERED", weight: 7 },
    { value: "RECEIVED", weight: 4 },
  ]);
}

function pickHistoricalGiftStatus(): GiftStatus {
  return faker.helpers.weightedArrayElement([
    { value: "AVAILABLE", weight: 6 },
    { value: "CLAIMED", weight: 8 },
    { value: "PURCHASED", weight: 18 },
    { value: "DELIVERED", weight: 36 },
    { value: "RECEIVED", weight: 32 },
  ]);
}

function toNonEmptyArray<T>(values: Array<T>, label: string): NonEmptyArray<T> {
  if (values.length === 0) {
    throw new Error(`${label} must contain at least one value`);
  }

  return values as NonEmptyArray<T>;
}

function earlierDate(left: Date, right: Date) {
  return left.getTime() <= right.getTime() ? left : right;
}

function addUtcDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function main() {
  const { families, children, gifts, seed } = parseArgs();

  faker.seed(seed);
  const now = new Date();

  const giftDrivesData = [generateGiftDrive(0), generateGiftDrive(1)];
  const usersData: Array<UserProfile> = [
    generateUser(UserRole.ADMIN, {
      id: "admin_1",
      email: "admin@test.com",
      name: "Admin User",
      phone: "+12675550100",
    }),
    generateUser(UserRole.DIRECTOR, {
      id: "director_1",
      email: "director@test.com",
      name: "Director Dana",
      phone: "+12155550101",
    }),
    generateUser(UserRole.VOLUNTEER, {
      id: "volunteer_1",
      email: "volunteer1@test.com",
      name: "Sam Volunteer",
      phone: "+12675550102",
    }),
    generateUser(UserRole.VOLUNTEER, {
      id: "volunteer_2",
      email: "volunteer2@test.com",
      name: "Taylor Volunteer",
    }),
    generateUser(UserRole.DONOR, {
      id: "donor_1",
      email: "donor1@test.com",
      name: "Test Donor One",
    }),
    generateUser(UserRole.DONOR, {
      id: "donor_2",
      email: "donor2@test.com",
      name: "Test Donor Two",
    }),
    generateUser(UserRole.DONOR, {
      id: "donor_3",
      email: "donor3@test.com",
      name: "Neighborhood Donor",
      phone: "+13015550103",
    }),
    generateUser(UserRole.DONOR, {
      id: "donor_4",
      email: "donor4@test.com",
      name: "Dormant Donor",
      enabled: false,
    }),
  ];
  const reviewerIds = toNonEmptyArray(
    usersData
      .filter((user) => user.role !== UserRole.DONOR && user.enabled)
      .map((user) => user.id),
    "reviewerIds",
  );
  const donorIds = toNonEmptyArray(
    usersData
      .filter((user) => user.role === UserRole.DONOR && user.enabled)
      .map((user) => user.id),
    "donorIds",
  );
  const inviteSenderIds = toNonEmptyArray(
    usersData
      .filter(
        (user) =>
          (user.role === UserRole.ADMIN || user.role === UserRole.DIRECTOR) &&
          user.enabled,
      )
      .map((user) => user.id),
    "inviteSenderIds",
  );
  const invitesData: Array<StaffInvite> = [
    generateInvite({
      sentBy: faker.helpers.arrayElement(inviteSenderIds),
      role: UserRole.ADMIN,
    }),
    generateInvite({
      sentBy: faker.helpers.arrayElement(inviteSenderIds),
      role: UserRole.VOLUNTEER,
    }),
    generateInvite({
      sentBy: faker.helpers.arrayElement(inviteSenderIds),
      role: UserRole.VOLUNTEER,
    }),
  ];
  const familiesData: Array<Family> = [];
  const familyLinksData: Array<FamilyLink> = [];
  const childrenData: Array<Child> = [];
  const giftsData: Array<Gift> = [];
  const claimsData: Array<Claim> = [];

  for (let familyIndex = 0; familyIndex < families; familyIndex += 1) {
    const giftDrive = giftDrivesData[familyIndex % giftDrivesData.length];
    const driveStart = new Date(giftDrive.startDate);
    const driveEnd = new Date(giftDrive.endDate);
    const familyUpperBound = earlierDate(driveEnd, now);
    const driveHasEnded = driveEnd.getTime() < now.getTime();
    const claimUpperBound = driveHasEnded
      ? earlierDate(addUtcDays(driveEnd, 21), now)
      : now;
    const family = generateFamily(giftDrive.id, reviewerIds, {
      createdBetween: {
        from: driveStart,
        to: familyUpperBound,
      },
    });
    familiesData.push(family);
    familyLinksData.push(generateFamilyLink(family.id));

    const allowPublishing =
      family.reviewStatus.approved && !family.reviewStatus.held;

    for (let childIndex = 0; childIndex < children; childIndex += 1) {
      const child = generateChild({
        familyId: family.id,
        giftDriveId: giftDrive.id,
        allowPublishing,
        createdAfter: new Date(family.createdAt),
        createdBefore: familyUpperBound,
      });
      childrenData.push(child);

      if (faker.datatype.boolean({ probability: 0.1 })) {
        continue;
      }

      for (let giftIndex = 0; giftIndex < gifts; giftIndex += 1) {
        if (faker.datatype.boolean({ probability: 0.2 })) continue;
        const backup = giftIndex >= 3;
        const active = giftIndex < 3;
        const status = active
          ? driveHasEnded
            ? pickHistoricalGiftStatus()
            : pickGiftStatus()
          : "AVAILABLE";

        if (status === "AVAILABLE") {
          giftsData.push(
            generateGift({
              childId: child.id,
              familyId: family.id,
              giftDriveId: giftDrive.id,
              status,
              backup,
              active,
              createdAfter: new Date(child.createdAt),
              createdBefore: familyUpperBound,
            }),
          );
          continue;
        }

        const donorId = faker.helpers.arrayElement(donorIds);
        const gift = generateGift({
          childId: child.id,
          familyId: family.id,
          giftDriveId: giftDrive.id,
          status,
          donorId,
          backup,
          active,
          createdAfter: new Date(child.createdAt),
          createdBefore: familyUpperBound,
        });

        giftsData.push(gift);

        if (donorId) {
          claimsData.push(
            generateClaim({
              giftId: gift.id,
              childId: child.id,
              donorId,
              driveId: giftDrive.id,
              giftStatus: status,
              createdAfter: new Date(gift.createdAt),
              createdBefore: claimUpperBound,
            }),
          );
        }
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        giftDrives: giftDrivesData,
        users: usersData,
        invites: invitesData,
        families: familiesData,
        familyLinks: familyLinksData,
        children: childrenData,
        gifts: giftsData,
        claims: claimsData,
      },
      null,
      2,
    ),
  );
}

main();
