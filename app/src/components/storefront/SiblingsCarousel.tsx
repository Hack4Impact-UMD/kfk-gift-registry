import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { CarouselCard } from "./CarouselCards";
import type { CarouselCardSibling } from "./CarouselCards";
import { cn } from "@/lib/utils";

type SiblingsCarouselProps = {
  siblings: Array<CarouselCardSibling>;
};

export function SiblingsCarousel({ siblings }: SiblingsCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };
    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;

    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;

      const goNext = delta > 0;
      if (goNext && !carouselApi.canScrollNext()) return;
      if (!goNext && !carouselApi.canScrollPrev()) return;

      e.preventDefault();
      if (goNext) carouselApi.scrollNext();
      else carouselApi.scrollPrev();
    };

    const node = carouselApi.rootNode();
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [carouselApi]);

  if (siblings.length === 0) {
    return (
      <p className="text-center text-muted-foreground font-gaegu">
        No siblings to show.
      </p>
    );
  }

  const chevronIconProps = {
    className: "size-9 shrink-0 text-black",
    strokeWidth: 2.25 as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <div className="flex w-full items-center gap-1 sm:gap-2 md:gap-4">
      <button
        type="button"
        aria-label="Previous siblings"
        disabled={!canScrollPrev}
        onClick={() => carouselApi?.scrollPrev()}
        className={cn(
          "shrink-0 cursor-pointer rounded-md p-1 text-black",
          "disabled:pointer-events-none disabled:cursor-default",
        )}
      >
        <ChevronLeft {...chevronIconProps} />
      </button>

      <div className="min-w-0 flex-1">
        <Carousel
          setApi={setCarouselApi}
          opts={{ align: "start", loop: false }}
          className="w-full"
        >
          <CarouselContent>
            {siblings.map((sibling) => (
              <CarouselItem
                key={sibling.id}
                className="flex min-h-0 basis-full md:basis-1/3"
              >
                <CarouselCard sibling={sibling} className="h-full w-full" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <button
        type="button"
        aria-label="Next siblings"
        disabled={!canScrollNext}
        onClick={() => carouselApi?.scrollNext()}
        className={cn(
          "shrink-0 cursor-pointer rounded-md p-1 text-black",
          "disabled:pointer-events-none disabled:cursor-default",
        )}
      >
        <ChevronRight {...chevronIconProps} />
      </button>
    </div>
  );
}
