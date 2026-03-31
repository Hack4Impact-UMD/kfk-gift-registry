import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import LadybugFootprints from "@/assets/ladybug-footprints.svg";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const rawValue = typeof value === "number" ? value : 0;
  const normalizedValue = Number.isFinite(rawValue)
    ? Math.min(Math.max(rawValue, 0), 100)
    : 0;
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

function StoreFrontProgress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const rawValue = typeof value === "number" ? value : 0;
  const normalizedValue = Number.isFinite(rawValue)
    ? Math.min(Math.max(rawValue, 0), 100)
    : 0;
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="relative h-full w-full flex-1 bg-kfk-yellow transition-all"
        style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${LadybugFootprints})`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "left",
          }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
}

export { Progress, StoreFrontProgress };
