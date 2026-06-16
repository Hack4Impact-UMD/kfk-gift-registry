import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/mutations/logoutMutation";

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
  const { mutate: logout, isPending } = useLogout();
  const initials = getInitials(displayName);

  function handleConfirmOpenChange(open: boolean) {
    if (isPending) return;
    setConfirmOpen(open);
  }

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => setConfirmOpen(false),
    });
  }

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

      <AlertDialog open={confirmOpen} onOpenChange={handleConfirmOpenChange}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-kfk-blue text-kfk-blue hover:bg-kfk-blue/10"
              disabled={isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleLogout();
              }}
              className="bg-kfk-blue text-white hover:bg-kfk-blue/90"
              disabled={isPending}
            >
              {isPending ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
