import { faker } from "@faker-js/faker";
import type { FormLink, GiftDrive } from "../../common/src/index.ts";

export function generateFormLink(
  giftDrive: GiftDrive,
  options: { showOnStorefront?: boolean } = {},
): FormLink {
  return {
    id: faker.string.uuid(),
    name: `${giftDrive.cycle} Registration`,
    driveId: giftDrive.id,
    active: true,
    showOnStorefront: options.showOnStorefront ?? false,
  };
}
