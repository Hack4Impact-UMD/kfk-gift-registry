import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";

type DonorProfileMenuProps = {
  displayName: string;
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

export function DonorProfileMenu({ displayName }: DonorProfileMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const initials = getInitials(displayName);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-auto gap-3 rounded-full px-2 py-1.5 text-kfk-blue hover:bg-kfk-blue/10"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-kfk-blue text-sm font-semibold text-white">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-32 truncate text-sm font-semibold md:max-w-48">
              {displayName}
            </span>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
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
