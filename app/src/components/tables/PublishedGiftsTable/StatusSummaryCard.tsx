import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatusSummaryCardProps {
  label: string;
  count: number;
  icon: ReactNode;
  variant:
    | "all"
    | "unpurchased"
    | "purchased"
    | "purchased_kfk"
    | "purchased_donor";
  onClick?: () => void;
  isActive?: boolean;
}

const variantStyles = {
  all: {
    bg: "bg-blue-100",
    text: "text-blue-900",
    iconBg: "bg-kfk-blue",
    iconColor: "text-white",
    hoverBg: "hover:bg-blue-200",
    activeBg: "bg-kfk-blue",
    activeText: "text-white",
    activeIconBg: "bg-white",
    activeIconColor: "text-kfk-blue",
    lineColor: "bg-kfk-blue",
  },
  unpurchased: {
    bg: "bg-red-100",
    text: "text-red-800",
    iconBg: "bg-kfk-red",
    iconColor: "text-white",
    hoverBg: "hover:bg-red-200",
    activeBg: "bg-kfk-red",
    activeText: "text-white",
    activeIconBg: "bg-white",
    activeIconColor: "text-kfk-red",
    lineColor: "bg-kfk-red",
  },
  purchased: {
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
  purchased_kfk: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    iconBg: "bg-[#005BFF]",
    iconColor: "text-white",
    hoverBg: "hover:bg-blue-200",
    activeBg: "bg-[#005BFF]",
    activeText: "text-white",
    activeIconBg: "bg-white",
    activeIconColor: "text-[#005BFF]",
    lineColor: "bg-[#005BFF]",
  },
  purchased_donor: {
    bg: "bg-green-100",
    text: "text-green-800",
    iconBg: "bg-[#118510]",
    iconColor: "text-white",
    hoverBg: "hover:bg-green-200",
    activeBg: "bg-[#118510]",
    activeText: "text-white",
    activeIconBg: "bg-white",
    activeIconColor: "text-[#118510]",
    lineColor: "bg-[#118510]",
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
    <div className="flex flex-col h-full">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        className={cn(
          "flex flex-1 items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors font-sans",
          isActive ? style.activeBg : style.bg,
          isActive ? style.activeText : style.text,
          !isActive && style.hoverBg,
        )}
      >
        <div
          className={cn(
            "p-2 rounded-full flex items-center justify-center",
            isActive ? style.activeIconBg : style.iconBg,
          )}
        >
          <div
            className={cn(
              "h-6 w-6 flex items-center justify-center",
              isActive ? style.activeIconColor : style.iconColor,
            )}
          >
            {icon}
          </div>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold">{count}</p>
        </div>
      </button>
      <div
        className={cn(
          "mt-2 h-1 rounded",
          isActive ? style.lineColor : "bg-transparent",
        )}
      />
    </div>
  );
}
