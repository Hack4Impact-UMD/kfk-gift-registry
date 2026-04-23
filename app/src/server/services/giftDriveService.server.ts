import type { GiftDrive } from "common";
import { DateTime } from "luxon";
import { getServerDB } from "@/lib/firebase.server";

export async function assertGiftDriveActive(
  tx: FirebaseFirestore.Transaction,
  driveId: string,
): Promise<GiftDrive> {
  const db = getServerDB();
  const driveSnap = await tx.get(db.giftDrives.doc(driveId));

  if (!driveSnap.exists) {
    throw new Error(`Gift drive ${driveId} not found`);
  }

  const drive = driveSnap.data()!;
  const now = DateTime.utc();
  const start = DateTime.fromISO(drive.startDate, { zone: "utc" });
  const end = DateTime.fromISO(drive.endDate, { zone: "utc" });

  if (!start.isValid || !end.isValid) {
    throw new Error(`Gift drive ${driveId} has invalid start/end date`);
  }

  if (now < start || now > end) {
    throw new Error(`Gift drive ${driveId} is not active`);
  }

  return drive;
}
