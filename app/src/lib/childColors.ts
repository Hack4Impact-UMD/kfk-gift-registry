export const CHILD_COLOR_NAMES = [
  "kfk-red",
  "kfk-brown",
  "kfk-green",
  "kfk-blue",
] as const;

export type ChildColorName = (typeof CHILD_COLOR_NAMES)[number];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Deterministically derives a color from an id (e.g. familyId) so the same
 * family/child always renders with the same color across the storefront
 * list, the wishlist detail page, and the family portal.
 */
export function getColorName(id: string): ChildColorName {
  return CHILD_COLOR_NAMES[hashId(id) % CHILD_COLOR_NAMES.length];
}

const COLOR_SELECTIONS: Record<ChildColorName, { bar: string; ring: string }> = {
  "kfk-red": { bar: "bg-kfk-red", ring: "ring-kfk-red" },
  "kfk-brown": { bar: "bg-kfk-brown", ring: "ring-kfk-brown" },
  "kfk-green": { bar: "bg-kfk-green", ring: "ring-kfk-green" },
  "kfk-blue": { bar: "bg-kfk-blue", ring: "ring-kfk-blue" },
};

export function getChildColors(childId: string) {
  return COLOR_SELECTIONS[getColorName(childId)];
}
