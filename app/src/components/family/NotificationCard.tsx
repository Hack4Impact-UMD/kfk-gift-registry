import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { FamilyNotification } from "common";
import { Button } from "@/components/ui/button";
import { useFamilyChild } from "@/hooks/queries/useFamilyChild";
import { getChildColors } from "@/lib/childColors";
import { ChildProfileCircle } from "./ChildProfileCircle";

type NotificationCardProps = {
  notification: FamilyNotification;
  token: string;
  onDismiss?: () => void;
};

export function NotificationCard({
  notification,
  token,
  onDismiss,
}: NotificationCardProps) {
  const { data } = useFamilyChild(token, notification.childId);
  const colorClasses = getChildColors(notification.childId);

  return (
    <div className="flex items-stretch rounded-r-[20px] bg-card overflow-hidden border-[2px] border-[#ececec]">
      <div className={`w-2 ${colorClasses.bar}`} />

      <div className="flex flex-1 items-center gap-4 px-4 py-3">
        <Link
          to="/family/$token/child/$childId"
          params={{ token, childId: notification.childId }}
          className="flex flex-1 items-center gap-4"
        >
          <ChildProfileCircle
            child={data?.child}
            compact
            token={token}
            ringClass={colorClasses.ring}
          />

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
