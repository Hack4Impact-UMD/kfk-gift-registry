import type { DonorNotificationListItem } from "./types";

export function formatNotificationTimestamp(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = Math.max(0, now - then);
  const hour = 1000 * 60 * 60;
  const day = hour * 24;
  const week = day * 7;

  if (diffMs < day) {
    const hours = Math.max(1, Math.floor(diffMs / hour));
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  if (diffMs < week * 4) {
    const weeks = Math.floor(diffMs / week);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
