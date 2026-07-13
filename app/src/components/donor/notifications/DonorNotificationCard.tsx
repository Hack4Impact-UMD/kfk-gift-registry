import { Link } from "@tanstack/react-router";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { DonorNotificationListItem } from "./types";
import {
  formatNotificationTimestamp,
  getNotificationAccentClass,
} from "./utils";

type DonorNotificationCardProps = {
  notification: DonorNotificationListItem;
  index: number;
};

export function DonorNotificationCard({
  notification,
  index,
}: DonorNotificationCardProps) {
  return (
    <Link
      to="/donor/notifications"
      search={{ notificationId: notification.id }}
      className="block"
    >
      <article className="overflow-hidden rounded-[22px] border border-[#E8E8E8] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex min-h-[128px]">
          <div className={cn("w-[7px] shrink-0", getNotificationAccentClass(index))} />
          <div className="flex flex-1 items-start gap-3 px-4 py-4">
            <Avatar className="mt-1 size-[56px] shrink-0 border border-[#F15A29] ring-1 ring-[#8BC34A]">
              <AvatarImage
                src={notification.childPhotoUrl}
                alt={notification.childName}
              />
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium leading-none text-[#6B7280]">
                    {notification.childName}
                  </p>
                  <h3 className="mt-1 text-[15px] font-bold leading-tight text-[#111827]">
                    {notification.title}
                  </h3>
                </div>
                <div className="shrink-0 text-right text-sm text-[#4B5563]">
                  {formatNotificationTimestamp(notification.createdAt)}
                </div>
              </div>

              <p className="mt-1 line-clamp-3 pr-2 text-[15px] leading-6 text-[#4B5563]">
                {notification.message}
              </p>
            </div>

            {!notification.read ? (
              <div className="mt-10 size-2.5 shrink-0 rounded-full bg-kfk-blue" />
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
