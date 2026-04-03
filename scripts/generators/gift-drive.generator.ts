import type { GiftDrive } from "../../common/src/index.ts";

const driveCycles = ["Spring", "Fall"] as const;

export function generateGiftDrive(index: number): GiftDrive {
  const now = new Date();
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + index * 4, 1),
  );
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 45);

  return {
    id: `gd_seed_${startDate.getUTCFullYear()}_${index + 1}`,
    createdAt: now.toISOString(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    cycle: `${driveCycles[index % driveCycles.length]} ${startDate.getUTCFullYear()}`,
  };
}
