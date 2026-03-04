import { Link } from "@tanstack/react-router";
import ProfilePhoto from "@/assets/default-profile-photo.png";
import { ExclamationCircleIcon } from "../icons";
import type { Child } from "@/mocks/mockFamily";

type Props = {
  child: Child;
  token: string;
};

export function ChildProfileCircle({ child, token }: Props) {
  const needsAttention = child.gifts.some(
  (gift) => gift.status === "delivered"
);
  return (
    <Link
      to="/family/$token/child/$childId"
      params={{ token, childId: child.id }}
      className="flex flex-col items-center gap-2 shrink-0"
    >
      <div className="relative w-16 h-16">
        <div
          className={`w-16 h-16 rounded-full border-2 border-background ring-2 ring-${child.color} flex items-center justify-center overflow-hidden`}
        >
          <img
            src={child.profileImage ?? ProfilePhoto}
            alt={child.name}
            className="w-full h-full object-cover"
          />
        </div>

        {needsAttention && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-kfk-red flex items-center justify-center text-white">
            <ExclamationCircleIcon className="size-5" />
          </div>
        )}
      </div>
      <span className="text-sm font-medium">{child.name}</span>
    </Link>
  );
}