import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { CarouselCard } from "./CarouselCards";
import type { CarouselCardSibling } from "./CarouselCards";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SiblingsCarouselProps = {
  siblings: Array<CarouselCardSibling>;
  orientation?: "horizontal" | "vertical";
};

const chevronIconProps = {
  className: "size-9 shrink-0 text-black",
  strokeWidth: 2.25 as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type NavButtonProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
};

function NavButton({
  label,
  disabled,
  onClick,
  className,
  children,
}: NavButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "shrink-0 cursor-pointer rounded-md p-1 text-black",
        "disabled:pointer-events-none disabled:cursor-default",
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function SiblingsCarousel({
  siblings,
  orientation = "horizontal",
}: SiblingsCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<Array<number>>([]);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setScrollSnaps(carouselApi.scrollSnapList());
      setCurrentIndex(carouselApi.selectedScrollSnap());
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
    // Only the horizontal carousel hijacks the wheel to scroll cards. The
    // vertical (side-panel) variant must leave vertical wheel events alone so
    // the page keeps scrolling normally; it relies on drag + up/down arrows.
    if (orientation !== "horizontal") return;
    if (!carouselApi) return;

    const onWheel = (e: WheelEvent) => {
      const horizontalDelta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? e.deltaX
          : e.shiftKey
            ? e.deltaY
            : 0;
      if (horizontalDelta === 0) return;

      const goNext = horizontalDelta > 0;
      if (goNext && !carouselApi.canScrollNext()) return;
      if (!goNext && !carouselApi.canScrollPrev()) return;

      e.preventDefault();
      if (goNext) carouselApi.scrollNext();
      else carouselApi.scrollPrev();
    };

    const node = carouselApi.rootNode();
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [carouselApi, orientation]);

  if (siblings.length === 0) {
    return (
      <p className="text-center text-muted-foreground font-gaegu">
        No siblings to show.
      </p>
    );
  }

  const isCentered = siblings.length < 3;

  if (orientation === "vertical") {
    return (
      <div className="flex h-full w-full flex-col items-center gap-2">
        <div className="min-h-0 w-full flex-1">
          <Carousel
            setApi={setCarouselApi}
            orientation="vertical"
            opts={{ align: "start", loop: false }}
            className="h-full w-full p-2"
          >
            <CarouselContent
              className={cn(
                "h-[clamp(26rem,58vh,36rem)]",
                isCentered && "justify-center",
              )}
            >
              {siblings.map((sibling) => (
                <CarouselItem
                  key={sibling.id}
                  className="flex min-h-0 basis-1/3"
                >
                  <CarouselCard sibling={sibling} className="h-full w-full" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <NavButton
          label="Next siblings"
          disabled={!canScrollNext}
          onClick={() => carouselApi?.scrollNext()}
        >
          <ChevronDown {...chevronIconProps} />
        </NavButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row w-full items-center gap-1 sm:gap-2 md:gap-4">
      <NavButton
        label="Previous siblings"
        disabled={!canScrollPrev}
        onClick={() => carouselApi?.scrollPrev()}
        className="hidden sm:block"
      >
        <ChevronLeft {...chevronIconProps} />
      </NavButton>

      <div className="min-w-64 flex-1">
        <Carousel
          setApi={setCarouselApi}
          opts={{ align: "start", loop: false }}
          className="w-full p-2"
        >
          <CarouselContent className={cn(isCentered && "justify-center")}>
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

      <NavButton
        label="Next siblings"
        disabled={!canScrollNext}
        onClick={() => carouselApi?.scrollNext()}
        className="hidden sm:block"
      >
        <ChevronRight {...chevronIconProps} />
      </NavButton>
      <div className="flex justify-center gap-2 mt-4 sm:hidden">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to sibling ${index + 1}`}
            onClick={() => carouselApi?.scrollTo(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentIndex ? "bg-gray-800 w-3" : "bg-gray-300",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                index === currentIndex ? "w-3 bg-gray-800" : "bg-gray-300",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
