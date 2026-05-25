import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { Notification } from "common";
import { getServerDB } from "@/lib/firebase.server";

const getFamilyNotificationsSchema = z.object({
  familyId: z.string().min(1),
});

export const getFamilyNotifications = createServerFn({ method: "POST" })
  .inputValidator(getFamilyNotificationsSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { familyId } = data;

    const notificationsSnap = await db.notifications
      .where("familyId", "==", familyId)
      .orderBy("createdAt", "desc")
      .get();

    const notifications: Array<Notification> = [];
    notificationsSnap.forEach((doc) => {
      notifications.push(doc.data() as Notification);
    });

    return { notifications };
  });

export const markNotificationAsRead = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      notificationId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { notificationId } = data;

    await db.notifications.doc(notificationId).update({
      read: true,
    });

    return { success: true };
  });

export const clearAllNotifications = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      familyId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { familyId } = data;

    const notificationsSnap = await db.notifications
      .where("familyId", "==", familyId)
      .get();

    const batch = db._instance.batch();
    notificationsSnap.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();

    return { success: true };
  });
