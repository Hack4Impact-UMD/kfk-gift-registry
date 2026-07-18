import type { DonorNotificationListItem } from "./types";
import ms from "ms";

export function formatNotificationTimestamp(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = Math.max(0, now - then);

  return `${ms(diffMs)} ago`;
}

export function getNotificationAccentClass(index: number): string {
  const accents = ["bg-kfk-red", "bg-[#FFD23F]", "bg-kfk-blue", "bg-kfk-green"];
  return accents[index % accents.length] ?? "bg-kfk-red";
}

export function filterNotifications(
  notifications: Array<DonorNotificationListItem>,
  tab: "unread" | "read",
) {
  if (tab === "unread") {
    return notifications.filter((notification) => !notification.read);
  }

  return notifications.filter((notification) => notification.read);
}
