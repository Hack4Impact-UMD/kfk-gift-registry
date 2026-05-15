import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "./types";

interface PendingProfilesTableActionButtonProps {
  statusFilter?: ApplicationStatus | null;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export function PendingProfilesTableActionButton({
  statusFilter = null,
  className,
  disabled = false,
  loading = false,
  onClick,
}: PendingProfilesTableActionButtonProps) {
  if (!statusFilter) {
    return null;
  }

  const label =
    statusFilter === "pending"
      ? "Move to Approve"
      : statusFilter === "approved"
        ? "Publish to Storefront"
        : "Delete";
  const buttonClassName =
    statusFilter === "holdfile"
      ? "bg-kfk-red text-white hover:bg-kfk-red/90"
      : undefined;

  return (
    <Button
      className={cn("min-w-36", buttonClassName, className)}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "Publishing..." : label}
    </Button>
  );
}
