import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { StaffInvite } from "../../common/src/index.ts";

type GenerateInviteOptions = {
  sentBy: string;
  role: StaffInvite["role"];
  used?: boolean;
};

function normalizeEmailPart(value: string, fallback: string) {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  return normalized.length > 0 ? normalized : fallback;
}

export function generateInvite({
  sentBy,
  role,
  used = false,
}: GenerateInviteOptions): StaffInvite {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const normalizedFirstName = normalizeEmailPart(
    firstName,
    `invite${faker.string.numeric(3)}`,
  );
  const normalizedLastName = normalizeEmailPart(
    lastName,
    `user${faker.string.numeric(3)}`,
  );

  return {
    id: uuidv7(),
    sentBy,
    name: `${firstName} ${lastName}`,
    email: `${normalizedFirstName}.${normalizedLastName}@example.com`,
    role,
    createdAt: faker.date.recent({ days: 6 }).toISOString(),
    used,
  };
}
