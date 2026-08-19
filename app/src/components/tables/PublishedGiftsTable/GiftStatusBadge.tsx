import { cn } from "@/lib/utils";
import type { GiftStatus } from "common";

interface GiftStatusBadgeProps {
  status: GiftStatus;
  className?: string;
}

export const GIFT_STATUS_CONFIG: Record<
  GiftStatus,
  { label: string; color: string }
> = {
  AVAILABLE: {
    label: "Unclaimed",
    color: "bg-red-300",
  },
  CLAIMED: {
    label: "Claimed",
    color: "bg-yellow-300",
  },
  PURCHASED: {
    label: "Purchased",
    color: "bg-orange-300",
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-300",
  },
  RECEIVED: {
    label: "Received",
    color: "bg-green-300",
  },
};

export function GiftStatusBadge({ status, className }: GiftStatusBadgeProps) {
  const config = GIFT_STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
      <span className="text-sm text-gray-600 font-sans">{config.label}</span>
    </div>
  );
}
