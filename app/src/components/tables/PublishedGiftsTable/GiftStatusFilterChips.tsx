import type { GiftStatus } from "common";
import { cn } from "@/lib/utils";
import type { GiftClaimStatus } from "./types";

const ALL_STATUSES: Array<GiftStatus> = [
  "AVAILABLE",
  "CLAIMED",
  "PURCHASED",
  "DELIVERED",
  "RECEIVED",
];

const CLAIMED_STATUSES: Array<GiftStatus> = [
  "CLAIMED",
  "PURCHASED",
  "DELIVERED",
  "RECEIVED",
];

export function getVisibleGiftStatuses(
  claimFilter: GiftClaimStatus | null,
): Array<GiftStatus> | null {
  if (claimFilter === "unclaimed") return null;
  if (claimFilter !== null) return CLAIMED_STATUSES;
  return ALL_STATUSES;
}

const statusConfig: Record<
  GiftStatus,
  { label: string; dotColor: string; activeBg: string; activeText: string }
> = {
  AVAILABLE: {
    label: "Unclaimed",
    dotColor: "bg-red-300",
    activeBg: "bg-red-100",
    activeText: "text-red-800",
  },
  CLAIMED: {
    label: "Claimed",
    dotColor: "bg-yellow-300",
    activeBg: "bg-yellow-100",
    activeText: "text-yellow-800",
  },
  PURCHASED: {
    label: "Purchased",
    dotColor: "bg-orange-300",
    activeBg: "bg-orange-100",
    activeText: "text-orange-800",
  },
  DELIVERED: {
    label: "Delivered",
    dotColor: "bg-green-300",
    activeBg: "bg-green-100",
    activeText: "text-green-800",
  },
  RECEIVED: {
    label: "Received",
    dotColor: "bg-emerald-400",
    activeBg: "bg-emerald-100",
    activeText: "text-emerald-800",
  },
};

interface GiftStatusFilterChipsProps {
  activeFilter: GiftStatus | null;
  claimFilter: GiftClaimStatus | null;
  onFilterChange: (status: GiftStatus | null) => void;
}

export function GiftStatusFilterChips({
  activeFilter,
  claimFilter,
  onFilterChange,
}: GiftStatusFilterChipsProps) {
  const visibleStatuses = getVisibleGiftStatuses(claimFilter);

  if (!visibleStatuses) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500 mr-1">
        Gift Status:
      </span>
      <button
        type="button"
        onClick={() => onFilterChange(null)}
        aria-pressed={activeFilter === null}
        className={cn(
          "cursor-pointer inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
          activeFilter === null
            ? "bg-kfk-blue text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200",
        )}
      >
        All
      </button>
      {visibleStatuses.map((status) => {
        const config = statusConfig[status];
        const isActive = activeFilter === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => onFilterChange(status)}
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? cn(config.activeBg, config.activeText)
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
