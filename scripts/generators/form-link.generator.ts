import { v7 as uuidv7 } from "uuid";
import type { FormLink, GiftDrive } from "../../common/src/index.ts";

export function generateFormLink(
  giftDrive: GiftDrive,
  options: { showOnStorefront?: boolean } = {},
): FormLink {
  return {
    id: uuidv7(),
    name: `${giftDrive.cycle} Registration`,
    driveId: giftDrive.id,
    active: true,
    showOnStorefront: options.showOnStorefront ?? false,
  };
}
