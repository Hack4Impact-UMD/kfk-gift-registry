import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { Child } from "common";
import { Button } from "@/components/ui/button";
import { ChildProfileCircle } from "@/components/family/ChildProfileCircle";

type NotificationCardProps = {
  child: Child;
  giftTitle: string;
  token: string;
  onDismiss?: () => void;
};

export function NotificationCard({
  child,
  giftTitle,
  token,
  onDismiss,
}: NotificationCardProps) {
  const colorClasses = {
    "kfk-red": { bar: "bg-kfk-red", ring: "ring-kfk-red" },
    "kfk-blue": { bar: "bg-kfk-blue", ring: "ring-kfk-blue" },
    "kfk-green": { bar: "bg-kfk-green", ring: "ring-kfk-green" },
  }[child.color] ?? { bar: "bg-kfk-red", ring: "ring-kfk-red" };

  return (
    <div className="flex items-stretch rounded-r-[20px] bg-card overflow-hidden border-[2px] border-[#ececec]">
      <div className={`w-2 ${colorClasses.bar}`} />

      <div className="flex flex-1 items-center gap-4 px-4 py-3">
        <Link
          to="/family/$token/child/$childId"
          params={{ token, childId: child.id }}
          className="flex flex-1 items-center gap-4"
        >
          <ChildProfileCircle
            child={child}
            ringClass={colorClasses.ring}
            token={token}
            compact
            disableLink
          />

          <div className="flex-1 min-w-0">
            <p className="font-semibold">{child.name} Gift Delivered!</p>

            <p className="text-sm text-foreground mt-1">
              {giftTitle}... gift was delivered! Confirm if you received the
              gift!
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
