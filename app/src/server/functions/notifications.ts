import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { FamilyNotification } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { getFamilyLinkById } from "@/server/services/familyLinkService.server";
import { chunk } from "@/lib/utils";

const getFamilyNotificationsSchema = z.object({
  familyId: z.string().min(1),
  driveId: z.string().min(1),
  token: z.string().min(1),
});

export const getFamilyNotifications = createServerFn({ method: "POST" })
  .inputValidator(getFamilyNotificationsSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { familyId, token, driveId } = data;

    const link = await getFamilyLinkById(token);
    if (!link || link.familyId !== familyId) {
      throw new Error("Unauthorized: Invalid family token");
    }

    const notificationsSnap = await db.notifications
      .where("familyId", "==", familyId)
      .where("driveId", "==", driveId)
      .orderBy("createdAt", "desc")
      .get();

    const notifications: Array<FamilyNotification> = notificationsSnap.docs.map(
      (doc) => doc.data(),
    );

    return { notifications };
  });

export const markNotificationAsRead = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      notificationId: z.string().min(1),
      token: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { notificationId, token } = data;

    const link = await getFamilyLinkById(token);
    if (!link) {
      throw new Error("Unauthorized: Invalid family token");
    }

    const notificationSnap = await db.notifications.doc(notificationId).get();
    if (!notificationSnap.exists) {
      throw new Error("Notification not found");
    }

    const notification = notificationSnap.data();
    if (notification?.familyId !== link.familyId) {
      throw new Error(
        "Unauthorized: Notification does not belong to this family",
      );
    }

    await db.notifications.doc(notificationId).update({
      read: true,
    });

    return { success: true };
  });

export const clearAllNotifications = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      familyId: z.string().min(1),
      driveId: z.string(),
      token: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { familyId, token, driveId } = data;

    const link = await getFamilyLinkById(token);
    if (!link || link.familyId !== familyId) {
      throw new Error("Unauthorized: Invalid family token");
    }

    const notificationsSnap = await db.notifications
      .where("familyId", "==", familyId)
      .where("driveId", "==", driveId)
      .where("read", "==", false)
      .get();

    const CHUNK_SIZE = 200;
    const docs = notificationsSnap.docs;
    const chunks = chunk(docs, CHUNK_SIZE);

    for (const c of chunks) {
      const batch = db._instance.batch();

      c.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    }

    return { success: true };
  });
