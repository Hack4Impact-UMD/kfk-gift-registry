import { useState } from "react";
import type { UserProfile } from "common";
import { UserRole } from "common";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { CalendarIcon, EnvelopeIcon, PhoneIcon } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { UpdateRoleDialog } from "./UpdateRoleDialog";
import { formatPhoneDisplay } from "../ui/phone-input";

interface UserCardProps {
  user: UserProfile;
  currentUser: UserProfile;
}

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  [UserRole.DIRECTOR]: {
    label: "Director",
    className: "bg-purple-100 text-purple-800",
  },
  [UserRole.ADMIN]: {
    label: "Admin",
    className: "bg-blue-100 text-blue-800",
  },
  [UserRole.VOLUNTEER]: {
    label: "Volunteer",
    className: "bg-green-100 text-green-800",
  },
  [UserRole.DONOR]: {
    label: "Donor",
    className: "bg-orange-100 text-orange-700",
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserCard({ user, currentUser }: UserCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updateRoleOpen, setUpdateRoleOpen] = useState(false);

  const isDirector = currentUser.role === UserRole.DIRECTOR;
  const canChangeRole =
    isDirector &&
    user.role !== UserRole.DIRECTOR &&
    user.role !== UserRole.DONOR;
  const canDelete = isDirector && user.id !== currentUser.id;

  const badge = ROLE_BADGE[user.role];

  return (
    <>
      <div className="flex items-center gap-4 rounded-lg border bg-card px-5 py-4 shadow-sm h-24">
        <Avatar size="lg" className="shrink-0">
          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{user.name}</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <EnvelopeIcon className="size-3.5 shrink-0" />
              {user.email}
            </span>
            {user.phone && (
              <span className="flex items-center gap-1.5">
                <PhoneIcon className="size-3.5 shrink-0" />
                {formatPhoneDisplay(user.phone)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 shrink-0" />
              {DateTime.fromISO(user.createdAt).toLocaleString(
                DateTime.DATE_MED,
              )}
            </span>
          </div>
        </div>

        {(canChangeRole || canDelete) && (
          <div className="flex shrink-0 gap-2">
            {canChangeRole && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setUpdateRoleOpen(true)}
              >
                Change role
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {canChangeRole && (
        <UpdateRoleDialog
          open={updateRoleOpen}
          onOpenChange={setUpdateRoleOpen}
          user={user}
        />
      )}
      {canDelete && (
        <DeleteUserDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          user={user}
        />
      )}
    </>
  );
}
