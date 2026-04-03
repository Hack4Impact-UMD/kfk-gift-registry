import { faker } from "@faker-js/faker";
import type { UserProfile } from "../../common/src/index.ts";

type GenerateUserOverrides = Partial<
  Pick<UserProfile, "id" | "email" | "name" | "phone" | "enabled">
>;

export function generateUser(
  role: UserProfile["role"],
  overrides: GenerateUserOverrides = {},
): UserProfile {
  return {
    id: overrides.id ?? faker.string.uuid(),
    email: (overrides.email ?? faker.internet.email()).toLowerCase(),
    name: overrides.name ?? faker.person.fullName(),
    role,
    phone:
      overrides.phone ??
      (faker.datatype.boolean({ probability: 0.7 })
        ? faker.phone.number()
        : undefined),
    createdAt: new Date().toISOString(),
    enabled: overrides.enabled ?? true,
  };
}
