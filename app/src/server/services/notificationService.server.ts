import { v7 as uuidv7 } from "uuid";
import type { NoId, FamilyNotification, FamilyNotificationType } from "common";
import { getServerDB } from "@/lib/firebase.server";

export async function publishNotification(
  tx: FirebaseFirestore.Transaction,
  notification: NoId<FamilyNotification>,
): Promise<string> {
  const db = getServerDB();
  const notificationId = uuidv7();

  tx.set(db.notifications.doc(notificationId), {
    id: notificationId,
    ...notification,
  });

  return notificationId;
}

export function createNotificationMessage(
  type: FamilyNotificationType,
  childName: string,
  donorName?: string,
): string {
  switch (type) {
    case "GIFT_CLAIMED":
      return `${donorName || "A donor"} has claimed a gift for ${childName}!`;
    case "GIFT_DELIVERED":
      return `${childName}'s gift has been delivered!`;
    case "GIFT_UPDATED":
      return `${childName}'s gift was updated.`;
    default:
      return "You have a new notification.";
  }
}
