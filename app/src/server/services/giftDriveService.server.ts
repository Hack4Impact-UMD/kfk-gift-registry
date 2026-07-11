import type { GiftDrive } from "common";
import { DateTime } from "luxon";
import { getServerDB } from "@/lib/firebase.server";

export function isGiftDriveActiveWindow(
  drive: Pick<GiftDrive, "startDate" | "endDate">,
  now = DateTime.utc(),
) {
  const start = DateTime.fromISO(drive.startDate, { zone: "utc" });
  const end = DateTime.fromISO(drive.endDate, { zone: "utc" });

  if (!start.isValid || !end.isValid) {
    return false;
  }

  return now >= start && now <= end;
}

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
  if (!isGiftDriveActiveWindow(drive)) {
    const start = DateTime.fromISO(drive.startDate, { zone: "utc" });
    const end = DateTime.fromISO(drive.endDate, { zone: "utc" });
    if (!start.isValid || !end.isValid) {
      throw new Error(`Gift drive ${driveId} has invalid start/end date`);
    }
    throw new Error(`Gift drive ${driveId} is not active`);
  }

  const start = DateTime.fromISO(drive.startDate, { zone: "utc" });
  const end = DateTime.fromISO(drive.endDate, { zone: "utc" });
  if (!start.isValid || !end.isValid) {
    throw new Error(`Gift drive ${driveId} has invalid start/end date`);
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

  return leftStart <= rightEnd && rightStart <= leftEnd;
}

function canBlockNewDriveWindow(drive: GiftDriveWindow, now: DateTime) {
  const end = DateTime.fromISO(drive.endDate, { zone: "utc" });

  if (!end.isValid) {
    return false;
  }

  // Completed or deactivated drives should not block creating a new drive.
  return end > now;
}

export async function assertGiftDriveWindowAvailable(
  tx: FirebaseFirestore.Transaction,
  candidate: GiftDriveWindow,
) {
  const db = getServerDB();
  const now = DateTime.utc();
  const existingDrives = (await tx.get(db.giftDrives)).docs.map((doc) =>
    doc.data(),
  );
  const conflictingDrive = existingDrives.find((drive) => {
    if (drive.id === candidate.id) return false;
    if (!canBlockNewDriveWindow(drive, now)) return false;
    return overlapsActiveWindow(drive, candidate);
  });

  if (conflictingDrive) {
    throw new Error(
      `Gift drive dates overlap with ${conflictingDrive.cycle}. Only active or upcoming drives can block a new date window.`,
    );
  }
}

export async function deactivateFormLinksForDrive(
  tx: FirebaseFirestore.Transaction,
  driveId: string,
  deactivatedAt = DateTime.utc().toISO(),
) {
  const db = getServerDB();
  const driveRef = db.giftDrives.doc(driveId);
  const driveSnap = await tx.get(driveRef);
  const drive = driveSnap.data();

  if (!drive) {
    throw new Error(`Gift drive ${driveId} not found`);
  }

  if (drive.formLinksDeactivatedAt) {
    return;
  }

  const linkSnap = await tx.get(db.formLinks.where("driveId", "==", driveId));

  for (const doc of linkSnap.docs) {
    tx.update(doc.ref, {
      active: false,
      showOnStorefront: false,
    });
  }

  tx.update(driveRef, {
    formLinksDeactivatedAt: deactivatedAt,
  });
}
