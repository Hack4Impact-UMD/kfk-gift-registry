import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { Notification } from "common";
import { getServerDB } from "@/lib/firebase.server";
import { getFamilyLinkById } from "@/server/services/familyLinkService.server";

const getFamilyNotificationsSchema = z.object({
  familyId: z.string().min(1),
  token: z.string().min(1),
});

export const getFamilyNotifications = createServerFn({ method: "POST" })
  .inputValidator(getFamilyNotificationsSchema)
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { familyId, token } = data;

    const link = await getFamilyLinkById(token);
    if (!link || link.familyId !== familyId) {
      throw new Error("Unauthorized: Invalid family token");
    }

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

    const notification = notificationSnap.data() as Notification;
    if (notification.familyId !== link.familyId) {
      throw new Error("Unauthorized: Notification does not belong to this family");
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
      token: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = getServerDB();
    const { familyId, token } = data;

    const link = await getFamilyLinkById(token);
    if (!link || link.familyId !== familyId) {
      throw new Error("Unauthorized: Invalid family token");
    }

    const notificationsSnap = await db.notifications
      .where("familyId", "==", familyId)
      .where("read", "==", false)
      .get();

    const CHUNK_SIZE = 200;
    const docs = notificationsSnap.docs;
    
    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const chunk = docs.slice(i, i + CHUNK_SIZE);
      const batch = db._instance.batch();
      
      chunk.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();
    }

    return { success: true };
  });
