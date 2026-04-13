import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "./types";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  holdfile: {
    label: "Holdfile",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-3 py-0.5 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
