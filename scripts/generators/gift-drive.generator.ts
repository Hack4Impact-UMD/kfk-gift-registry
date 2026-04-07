import type { GiftDrive } from "../../common/src/index.ts";

const driveWindows = [
  {
    startOffsetDays: -28,
    endOffsetDays: 56,
  },
  {
    startOffsetDays: -210,
    endOffsetDays: -140,
  },
] as const;

function addUtcDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function getSeasonLabel(date: Date) {
  const month = date.getUTCMonth();

  if (month <= 1 || month === 11) {
    return "Winter";
  }

  if (month <= 4) {
    return "Spring";
  }

  if (month <= 7) {
    return "Summer";
  }

  return "Fall";
}

export function generateGiftDrive(index: number): GiftDrive {
  const now = new Date();
  const window = driveWindows[index] ?? {
    startOffsetDays: -(index + 1) * 30,
    endOffsetDays: index * 30 + 30,
  };
  const startDate = addUtcDays(now, window.startOffsetDays);
  const endDate = addUtcDays(now, window.endOffsetDays);
  const cycle = `${getSeasonLabel(startDate)} ${startDate.getUTCFullYear()}`;

  return {
    id: `gd_seed_${cycle.toLowerCase().replace(/\s+/g, "_")}_${index + 1}`,
    createdAt: addUtcDays(startDate, -14).toISOString(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    cycle,
  };
}
