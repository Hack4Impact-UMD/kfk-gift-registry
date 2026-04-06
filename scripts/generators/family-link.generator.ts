import { randomBytes } from "node:crypto";
import type { FamilyLink } from "../../common/src/index.ts";

export function generateFamilyLink(familyId: string): FamilyLink {
  return {
    id: randomBytes(16).toString("base64url"),
    familyId,
    active: true,
  };
}
