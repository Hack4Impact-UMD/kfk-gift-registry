import { cn } from "@/lib/utils";

interface StatusSummaryCardProps {
  label: string;
  count: number;
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
    bg: "bg-kfk-blue",
    text: "text-white",
    activeBg: "bg-kfk-blue",
    activeText: "text-white",
    lineColor: "var(--color-kfk-blue)",
  },
  unpurchased: {
    bg: "bg-kfk-red",
    text: "text-white",
    activeBg: "bg-kfk-red",
    activeText: "text-white",
    lineColor: "var(--color-kfk-red)",
  },
  purchased: {
    bg: "bg-kfk-green",
    text: "text-white",
    activeBg: "bg-kfk-green",
    activeText: "text-white",
    lineColor: "var(--color-kfk-green)",
  },
  purchased_kfk: {
    bg: "bg-[#005BFF]",
    text: "text-white",
    activeBg: "bg-[#005BFF]",
    activeText: "text-white",
    lineColor: "#005BFF",
  },
  purchased_donor: {
    bg: "bg-[#118510]",
    text: "text-white",
    activeBg: "bg-[#118510]",
    activeText: "text-white",
    lineColor: "#118510",
  },
};

export function StatusSummaryCard({
  label,
  count,
  variant,
  onClick,
  isActive = false,
}: StatusSummaryCardProps) {
  const style = variantStyles[variant];

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        className={cn(
          "flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all font-sans",
          isActive ? style.activeBg : style.bg,
          isActive ? style.activeText : style.text,
        )}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm text-white opacity-90">{label}</span>
          <span className="text-2xl text-white">{count}</span>
        </div>
      </button>
      {isActive && (
        <div
          className="h-1 rounded-full"
          style={{ backgroundColor: style.lineColor }}
        />
      )}
    </div>
  );
}
