import { cn } from "@/lib/utils";

interface GiftStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string }
> = {
  unclaimed: {
    label: "Unclaimed",
    color: "bg-red-300",
  },
  claimed: {
    label: "Claimed",
    color: "bg-yellow-300",
  },
  purchased: {
    label: "Purchased",
    color: "bg-orange-300",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-300",
  },
};

export function GiftStatusBadge({ status, className }: GiftStatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
      <span className="text-sm text-gray-600 font-sans">{config.label}</span>
    </div>
  );
}
