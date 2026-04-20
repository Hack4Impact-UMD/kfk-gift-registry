import { cn } from "@/lib/utils";
import type { GiftPurchaseStatus } from "./types";

interface SponsorTypeBadgeProps {
  sponsorType: GiftPurchaseStatus;
  className?: string;
}

const sponsorTypeConfig: Record<
  GiftPurchaseStatus,
  { label: string; className: string; style?: React.CSSProperties }
> = {
  unpurchased: {
    label: "",
    className: "hidden",
  },
  purchased: {
    label: "",
    className: "hidden",
  },
  purchased_kfk: {
    label: "KFK Team",
    className: "text-white border-0",
    style: { backgroundColor: "#005BFF" },
  },
  purchased_donor: {
    label: "Donor",
    className: "text-white border-0",
    style: { backgroundColor: "#118510" },
  },
};

export function SponsorTypeBadge({
  sponsorType,
  className,
}: SponsorTypeBadgeProps) {
  const config = sponsorTypeConfig[sponsorType];

  if (!config.label) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-4 py-1 text-xs font-semibold w-24",
        config.className,
        className,
      )}
      style={config.style}
    >
      {config.label}
    </span>
  );
}
