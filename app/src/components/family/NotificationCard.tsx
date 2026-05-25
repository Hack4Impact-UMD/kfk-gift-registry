import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { Notification } from "common";
import { Button } from "@/components/ui/button";

type NotificationCardProps = {
  notification: Notification;
  token: string;
  childName?: string;
  onDismiss?: () => void;
};

const color_selections = [
  { bar: "bg-kfk-red", ring: "ring-kfk-red" },
  { bar: "bg-kfk-blue", ring: "ring-kfk-blue" },
  { bar: "bg-kfk-green", ring: "ring-kfk-green" },
] as const;

export function NotificationCard({
  notification,
  token,
  childName,
  onDismiss,
}: NotificationCardProps) {
  // hash function to determine color (persists as the same across all renders)
  const colorIndex = (notification.childId.charCodeAt(0) || 0) % color_selections.length;
  const colorClasses = color_selections[colorIndex];

  return (
    <div className="flex items-stretch rounded-r-[20px] bg-card overflow-hidden border-[2px] border-[#ececec]">
      <div className={`w-2 ${colorClasses.bar}`} />

      <div className="flex flex-1 items-center gap-4 px-4 py-3">
        <Link
          to="/family/$token/child/$childId"
          params={{ token, childId: notification.childId }}
          className="flex flex-1 items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-full ${colorClasses.ring} ring-2 flex items-center justify-center bg-muted`}>
            <span className="text-sm font-semibold text-center">
              {childName?.charAt(0) || "?"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold">{notification.message}</p>

            <p className="text-xs text-muted-foreground mt-1">
              {new Date(notification.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>

        <Button
          variant="ghost"
          aria-label="Dismiss notification"
          className="text-black flex items-center justify-center self-start"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDismiss?.();
          }}
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
