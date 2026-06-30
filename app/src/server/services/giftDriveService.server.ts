import type { GiftDrive } from "common";
import { DateTime } from "luxon";
import { getServerDB } from "@/lib/firebase.server";

export async function assertGiftDriveActive(
  tx: FirebaseFirestore.Transaction,
  driveId: string,
): Promise<GiftDrive> {
  const db = getServerDB();
  const driveSnap = await tx.get(db.giftDrives.doc(driveId));

  const drive = driveSnap.data();

  if (!drive) {
    throw new Error(`Gift drive ${driveId} not found`);
  }
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

type GiftDriveWindow = Pick<
  GiftDrive,
  "id" | "cycle" | "startDate" | "endDate"
>;

function overlapsActiveWindow(left: GiftDriveWindow, right: GiftDriveWindow) {
  const leftStart = DateTime.fromISO(left.startDate, { zone: "utc" });
  const leftEnd = DateTime.fromISO(left.endDate, { zone: "utc" });
  const rightStart = DateTime.fromISO(right.startDate, { zone: "utc" });
  const rightEnd = DateTime.fromISO(right.endDate, { zone: "utc" });

  if (
    !leftStart.isValid ||
    !leftEnd.isValid ||
    !rightStart.isValid ||
    !rightEnd.isValid
  ) {
    return false;
  }

  return leftStart < rightEnd && rightStart < leftEnd;
}

export async function assertGiftDriveWindowAvailable(
  candidate: GiftDriveWindow,
) {
  const db = getServerDB();
  const existingDrives = (await db.giftDrives.get()).docs.map((doc) =>
    doc.data(),
  );
  const conflictingDrive = existingDrives.find((drive) => {
    if (drive.id === candidate.id) return false;
    return overlapsActiveWindow(drive, candidate);
  });

  if (conflictingDrive) {
    throw new Error(
      `Gift drive dates overlap with ${conflictingDrive.cycle}. Only one active drive is allowed at a time.`,
    );
  }
}
