import { getServerDB } from "@/lib/firebase.server";
import { createServerFn } from "@tanstack/react-start";
import { v7 as uuidv7 } from "uuid";
import { DateTime } from "luxon";
import { GiftDriveInputSchema, GiftDriveUpdateSchema, UserRole } from "common";
import { requireRolesMiddleware } from "@/server/middleware/authMiddleware";
import { assertGiftDriveWindowAvailable } from "@/server/services/giftDriveService.server";

const adminOnly = requireRolesMiddleware([UserRole.DIRECTOR, UserRole.ADMIN]);

export const getAllGiftDrives = createServerFn().handler(async () => {
  const db = getServerDB();
  return (await db.giftDrives.get()).docs.map((d) => d.data());
});

export const getGiftDriveById = createServerFn()
  .inputValidator((data: { id: string }) => data.id)
  .handler(async ({ data: id }) => {
    const db = getServerDB();
    return (await db.giftDrives.doc(id).get()).data();
  });

export const getActiveGiftDrive = createServerFn().handler(async () => {
  const now = DateTime.utc();
  const db = getServerDB();

  const active = (
    await db.giftDrives
      .where("startDate", "<=", now.toISO())
      .where("endDate", ">=", now.toISO())
      .limit(1)
      .get()
  ).docs[0];

  if (active && active.exists) {
    return active.data();
  }

  return null;
});

export const createGiftDrive = createServerFn({ method: "POST" })
  .middleware([adminOnly])
  .inputValidator(GiftDriveInputSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const id = uuidv7();
    const giftDrive = {
      id,
      createdAt: DateTime.utc().toISO(),
      ...data,
    };

    await assertGiftDriveWindowAvailable(giftDrive);
    await db.giftDrives.doc(id).set(giftDrive);
    return giftDrive;
  });

export const updateGiftDrive = createServerFn({ method: "POST" })
  .middleware([adminOnly])
  .inputValidator(GiftDriveUpdateSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { id, ...fields } = data;

    await assertGiftDriveWindowAvailable(data);
    await db.giftDrives.doc(id).update(fields);
  });

export const deactivateGiftDrive = createServerFn({ method: "POST" })
  .middleware([adminOnly])
  .inputValidator((data: { id: string }) => data.id)
  .handler(async ({ data: id }) => {
    const db = getServerDB();
    const driveRef = db.giftDrives.doc(id);
    const driveSnap = await driveRef.get();
    const drive = driveSnap.data();

    if (!drive) {
      throw new Error("Gift drive not found");
    }

    const now = DateTime.utc();
    const start = DateTime.fromISO(drive.startDate, { zone: "utc" });
    const end = DateTime.fromISO(drive.endDate, { zone: "utc" });

    if (!start.isValid || !end.isValid) {
      throw new Error("Gift drive has invalid dates");
    }

    if (start > now || end < now) {
      throw new Error("Only an active gift drive can be deactivated");
    }

    await driveRef.update({
      endDate: now.toISO(),
    });
  });
