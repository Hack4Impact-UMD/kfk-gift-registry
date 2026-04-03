import { faker } from "@faker-js/faker";
import type { FamilyLink } from "../../common/src/index.ts";

export function generateFamilyLink(familyId: string): FamilyLink {
  return {
    id: faker.string.alphanumeric(22),
    familyId,
    active: true,
  };
}
