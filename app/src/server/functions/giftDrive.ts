import { getServerDB } from "@/lib/firebase.server";
import { createServerFn } from "@tanstack/react-start";

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
