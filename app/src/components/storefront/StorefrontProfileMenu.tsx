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

export function StorefrontProfileMenu({ auth }: StorefrontProfileMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const displayName = auth.authUser.displayName ?? "User";
  const initials = getInitials(displayName);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-auto gap-1.5 rounded-full px-1.5 py-1 text-kfk-blue hover:bg-kfk-blue/10"
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
            {auth.authUser.role === UserRole.DONOR ? (
              <Link to="/donor/home">Go to Donor Home</Link>
            ) : (
              <Link to="/staff/home">Go to Staff Home</Link>
            )}
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
