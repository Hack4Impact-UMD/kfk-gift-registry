import { getServerDB } from "@/lib/firebase.server";
import { createServerFn } from "@tanstack/react-start";
import { DateTime } from "luxon";

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
  } else {
    return undefined;
  }
});
