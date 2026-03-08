import { Link } from "@tanstack/react-router";
import ProfilePhoto from "@/assets/default-profile-photo.png";
import { ExclamationCircleIcon } from "../icons";
import type { Child } from "@/mocks/mockFamily";

type Props = {
  child: Child;
  ringClass: string;
  token: string;
  compact?: boolean;
  disableLink?: boolean;
};

export function ChildProfileCircle({ child, ringClass, token, compact, disableLink }: Props) {
  const needsAttention = child.gifts.some(
  (gift) => gift.status === "delivered"
);

  const content = (
    <>
      <div className="relative w-16 h-16">
        <div className={`w-16 h-16 rounded-full border-2 border-background ring-2 ${ringClass} flex items-center justify-center overflow-hidden`}>
          <img
            src={child.profileImage ?? ProfilePhoto}
            alt={child.name}
            className="w-full h-full object-cover"
          />
        </div>
        {needsAttention && !compact && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-kfk-red flex items-center justify-center text-white">
            <ExclamationCircleIcon className="size-5" />
          </div>
        )}
      </div>
      {!compact && <span className="text-sm font-medium">{child.name}</span>}
    </>
  );

  if (disableLink) {
    return <div className="flex flex-col items-center gap-2 shrink-0">{content}</div>;
  }

  return (
    <Link
      to="/family/$token/child/$childId"
      params={{ token, childId: child.id }}
      className="flex flex-col items-center gap-2 shrink-0"
    >
      {content}
    </Link>
  );
}