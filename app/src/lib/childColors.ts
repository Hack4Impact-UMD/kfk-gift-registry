const COLOR_SELECTIONS = [
  { bar: "bg-kfk-red", ring: "ring-kfk-red" },
  { bar: "bg-kfk-blue", ring: "ring-kfk-blue" },
  { bar: "bg-kfk-green", ring: "ring-kfk-green" },
] as const;

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getChildColors(childId: string) {
  return COLOR_SELECTIONS[hashId(childId) % COLOR_SELECTIONS.length];
}
