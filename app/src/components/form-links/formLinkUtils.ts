import type { FormLink, GiftDrive } from "common";

/** Human-readable label for a gift drive. Drives have no name, only a cycle. */
export function driveLabel(drive: GiftDrive): string {
  return `${drive.cycle} Gift Drive`;
}

export function formLinkName(link: FormLink, drive?: GiftDrive): string {
  if (link.name && link.name.trim()) return link.name.trim();
  return drive ? `${driveLabel(drive)} Form Link` : "Untitled Form Link";
}

export function formLinkUrl(linkId: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/family/form/${linkId}`;
}
