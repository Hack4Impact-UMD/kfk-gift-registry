import { Link } from "@tanstack/react-router";
import { FilledGiftIcon } from "@/components/icons/FilledGiftIcon";
import defaultProfilePhoto from "@/assets/default-profile-photo.png";
import { cn } from "@/lib/utils";
import type { ChildCategory } from "common";

export type CarouselCardSibling = {
  id: string;
  name: string;
  photoUrl?: string;
  category: ChildCategory;
  giftsFulfilled?: number;
  giftsTotal?: number;
};

type CarouselCardProps = {
  sibling: CarouselCardSibling;
  className?: string;
};

export function CarouselCard({ sibling, className }: CarouselCardProps) {
  const categoryLabel =
    sibling.category === "warrior" ? "Warrior" : "Super Sib";
  const fulfilled = sibling.giftsFulfilled ?? 0;
  const total = sibling.giftsTotal ?? 3;

  const badgeClass =
    sibling.category === "warrior"
      ? "bg-kfk-muted-yellow/30 text-kfk-brown border-kfk-brown"
      : "bg-kfk-light-blue/80 text-kfk-blue border-kfk-blue/50";

  return (
    <Link
      to="/child/$childId"
      params={{ childId: sibling.id }}
      className={cn(
        "@container/card [container-type:inline-size] flex min-h-0 w-full items-stretch overflow-hidden rounded-[clamp(0.75rem,3cqw,1.25rem)] border-2 border-kfk-red bg-[#fff5f7]",
        "gap-[clamp(0.5rem,2.5cqw,1rem)] px-[clamp(0.5rem,3cqw,1rem)] py-[clamp(0.65rem,3.5cqw,1.25rem)]",
        "text-left shadow-sm transition-opacity hover:opacity-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kfk-red/50 focus-visible:ring-offset-2",
        className,
        "h-full min-h-0",
      )}
    >
      <div className="flex min-h-0 w-[44%] shrink-0 flex-col items-stretch gap-[clamp(0.25rem,1.5cqw,0.5rem)] self-stretch">
        <div className="aspect-[128.8/108] w-full min-h-0 shrink overflow-hidden rounded-[clamp(0.5rem,2.5cqw,1rem)] border border-black bg-muted">
          <img
            src={sibling.photoUrl || defaultProfilePhoto}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-h-[1.5rem] flex-1 shrink-0 flex-col justify-center">
          <div className="flex w-full items-center justify-center gap-[clamp(0.25rem,1.25cqw,0.5rem)] text-center text-foreground">
            <FilledGiftIcon
              className="block shrink-0 [width:clamp(11px,min(8.4cqw,4vw),21px)] [height:clamp(11px,min(8.4cqw,4vw),21px)]"
              aria-hidden
            />
            <span className="flex items-center font-gaegu font-normal leading-none text-gray-900 [font-size:clamp(10px,min(7cqw,3.5vw),15px)]">
              {fulfilled}/{total} Gifts Fulfilled
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col py-[clamp(0.125rem,0.75cqw,0.25rem)]">
        <p className="font-gaegu font-bold leading-snug text-gray-950 [font-size:clamp(0.875rem,5.5cqw,1.5625rem)]">
          {sibling.name}
        </p>
        <div className="mt-auto flex w-full flex-col gap-[clamp(0.25rem,1.5cqw,0.5rem)] pt-[clamp(0.25rem,1.5cqw,0.5rem)]">
          <span
            className={cn(
              "flex w-full items-center justify-center rounded-lg border font-gaegu font-bold",
              "px-[clamp(0.5rem,2.5cqw,1rem)] py-[clamp(0.25rem,1.5cqw,0.5rem)]",
              "[font-size:clamp(0.8rem,4cqw,1rem)]",
              badgeClass,
            )}
          >
            {categoryLabel}
          </span>
          <span
            className="flex w-full items-center text-center justify-center rounded-full border-2 border-kfk-red bg-white px-[clamp(0.75rem,3cqw,1rem)] py-[clamp(0.25rem,1.5cqw,0.5rem)] font-gaegu font-bold text-kfk-red [font-size:clamp(0.8rem,4cqw,1rem)]"
            aria-hidden
          >
            View More
          </span>
        </div>
      </div>
    </Link>
  );
}
