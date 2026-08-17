import { Link } from "@tanstack/react-router";
import { ChevronRight, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DonorHomeChildCardProps } from "./homeRouteTypes";
import { getGiftStatusClass, getGiftStatusLabel } from "./homeRouteUtils";

export function CommitmentCard({ child }: DonorHomeChildCardProps) {
  const visibleGifts = child.gifts.slice(0, 3);

  return (
    <div className="rounded-none border-x-0 border-b border-t border-[#E5E7EB] bg-white px-4 py-4 shadow-none md:rounded-[24px] md:border md:px-5 md:py-5 md:shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={child.photoUrl}
          alt={`${child.firstName} ${child.lastName}`.trim()}
          className="h-[54px] w-[54px] shrink-0 rounded-full object-cover ring-2 ring-[#8BC34A]"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="font-gaegu text-[28px] font-bold leading-none text-[#1F2937]">
              {`${child.firstName} ${child.lastName}`.trim()}
            </h3>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-none",
                child.category === "Warrior"
                  ? "bg-[#FFF1B8] text-[#8A5A00]"
                  : "bg-[#D4EAFF] text-[#1D4ED8]",
              )}
            >
              {child.category === "Supersib" ? "Super Sib" : child.category}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {visibleGifts.map((gift) => (
              <div key={gift.id} className="flex items-center gap-3">
                <Gift
                  className="size-4 shrink-0 text-[#1D4ED8]"
                  strokeWidth={2.2}
                />
                <div className="min-w-0 flex flex-1 items-center gap-2">
                  <p className="truncate text-[15px] text-[#1F2937]">
                    {gift.title}
                  </p>
                  <span className={getGiftStatusClass(gift.status)}>
                    {getGiftStatusLabel(gift.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <Link
              to="/donor/home"
              search={{ childId: child.id }}
              className="inline-flex items-center gap-1 font-gaegu text-[24px] font-bold text-[#173B8F]"
            >
              <span>View Actions</span>
              <ChevronRight className="size-5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
