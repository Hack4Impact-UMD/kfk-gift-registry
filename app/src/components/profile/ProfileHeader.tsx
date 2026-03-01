import profileHeaderImage from "../../assets/profile-header-image.png";
import type { AuthUser } from "@/server/auth.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PencilSquare } from "@/components/icons/PencilSquare";

interface ProfileHeaderProps {
  user: AuthUser;
  avatarUrl?: string;
  onEdit?: () => void;
}

function getInitials(displayName?: string) {
  if (!displayName) return "U";

  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ProfileHeader({ user, avatarUrl }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-card px-6 py-6 flex border-3 border-kfk-light-blue gap-6 items-center">
      <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-kfk-blue text-white text-[30px] font-semibold">
          {getInitials(user?.displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-2">
          <h2 className="text-3xl font-semibold text-foreground">
            {user?.displayName || "User Name"}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Edit profile header"
            className="group hover:bg-muted rounded-md"
          >
            <PencilSquare className="text-muted-foreground transition-colors size-4 group-hover:text-foreground" />
          </Button>
        </div>
        <p className="text-muted-foreground">
          KFK{" "}
          {user?.role
            ? user.role.charAt(0).toUpperCase() +
              user.role.slice(1).toLowerCase()
            : ""}
        </p>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-24 hidden h-full w-48 select-none lg:block"
      >
        <img
          src={profileHeaderImage}
          alt="profile header decoration"
          className="absolute -top-28 -right-12 h-96 w-auto rotate-[30deg] overflow-hidden opacity-90"
        />
      </div>
    </div>
  );
}
