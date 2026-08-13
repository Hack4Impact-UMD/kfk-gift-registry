import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { UserRole } from "common";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import type { AuthContextAuthenticated } from "@/server/functions/auth";

type StorefrontProfileMenuProps = {
  auth: AuthContextAuthenticated;
};

function getInitials(displayName: string) {
  return displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getHomeDestination(role: UserRole) {
  switch (role) {
    case UserRole.DONOR:
      return { to: "/donor/home" as const, label: "Go to Donor Portal" };
    case UserRole.DIRECTOR:
    case UserRole.ADMIN:
    case UserRole.VOLUNTEER:
      return { to: "/staff/home" as const, label: "Go to Staff Portal" };
    default: {
      const unsupportedRole: never = role;
      throw new Error(`Unsupported role: ${unsupportedRole}`);
    }
  }
}

export function StorefrontProfileMenu({ auth }: StorefrontProfileMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const displayName = auth.authUser.displayName ?? "User";
  const initials = getInitials(displayName);
  const homeDestination = getHomeDestination(auth.authUser.role);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2 rounded-md px-3 text-kfk-blue"
          >
            <Avatar className="size-6">
              <AvatarFallback className="bg-kfk-blue text-xs font-semibold text-white">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-32 truncate text-sm font-medium">
              {displayName}
            </span>
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild className="text-kfk-blue">
            <Link to={homeDestination.to}>{homeDestination.label}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-kfk-blue"
          >
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} />
    </>
  );
}
