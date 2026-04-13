import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatusSummaryCardProps {
  label: string;
  count: number;
  icon: ReactNode;
  variant: "all" | "pending" | "approved" | "holdfile";
  onClick?: () => void;
  isActive?: boolean;
}

const variantStyles = {
  all: {
    bg: "bg-blue-100",
    text: "text-blue-900",
    iconBg: "bg-blue-800",
    iconColor: "text-white",
    hoverBg: "hover:bg-blue-200",
    activeBg: "bg-blue-800",
    activeText: "text-white",
    activeIconBg: "bg-white",
    activeIconColor: "text-blue-800",
    lineColor: "bg-blue-800",
  },
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    iconBg: "bg-kfk-yellow",
    iconColor: "text-white",
    hoverBg: "hover:bg-yellow-200",
    activeBg: "bg-kfk-yellow",
    activeText: "text-white",
    activeIconBg: "bg-white",
    activeIconColor: "text-kfk-yellow",
    lineColor: "bg-kfk-yellow",
  },
  approved: {
    bg: "bg-green-100",
    text: "text-green-800",
    iconBg: "bg-kfk-green",
    iconColor: "text-white",
    hoverBg: "hover:bg-green-200",
    activeBg: "bg-kfk-green",
    activeText: "text-white",
    activeIconBg: "bg-white",
    activeIconColor: "text-kfk-green",
    lineColor: "bg-kfk-green",
  },
  holdfile: {
    bg: "bg-red-100",
    text: "text-red-800",
    iconBg: "bg-red-800",
    iconColor: "text-white",
    hoverBg: "hover:bg-red-200",
    activeBg: "bg-red-800",
    activeText: "text-white",
    activeIconBg: "bg-white",
    activeIconColor: "text-red-800",
    lineColor: "bg-red-800",
  },
};

export function StatusSummaryCard({
  label,
  count,
  icon,
  variant,
  onClick,
  isActive = false,
}: StatusSummaryCardProps) {
  const style = variantStyles[variant];

  return (
    <div className="flex flex-col">
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors",
          isActive ? style.activeBg : style.bg,
          isActive ? style.activeText : style.text,
          !isActive && style.hoverBg,
        )}
      >
        <div className={cn("p-2 rounded-full flex items-center justify-center", isActive ? style.activeIconBg : style.iconBg)}>
          <div className={cn("h-6 w-6 flex items-center justify-center", isActive ? style.activeIconColor : style.iconColor)}>{icon}</div>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold">{count}</p>
        </div>
      </button>
      {isActive && (
        <div className={cn("mt-2 h-1 rounded", style.lineColor)} />
      )}
    </div>
  );
}
