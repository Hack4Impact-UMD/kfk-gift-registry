import { Link } from "@tanstack/react-router";
import type { Child } from "common";
import ProfilePhoto from "@/assets/default-profile-photo.png";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

type ChildProfileCircleProps = {
  child?: Child;
  ringClass?: string;
  token: string;
  compact?: boolean;
  disableLink?: boolean;
};

export function ChildProfileCircle({
  child,
  ringClass = "",
  token,
  compact,
  disableLink,
}: ChildProfileCircleProps) {
  const content = (
    <>
      <Avatar
        className={`size-16 border-2 border-background ring-2 ${ringClass}`}
      >
        <AvatarImage
          src={child?.photoUrl ?? ProfilePhoto}
          alt={child?.name || ""}
        />
      </Avatar>
      {!compact && <span className="text-sm font-medium">{child?.name}</span>}
    </>
  );

  if (!child || disableLink) {
    return (
      <div className="flex flex-col items-center gap-2 shrink-0">{content}</div>
    );
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
