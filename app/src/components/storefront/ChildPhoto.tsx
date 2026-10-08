import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

// How far (as a fraction) the photo's aspect ratio may differ from the frame's
// before we stop cropping it with object-cover and letterbox it instead.
const COVER_RATIO_TOLERANCE = 0.15;

interface ChildPhotoProps {
  src: string;
  alt: string;
  /** Sizing classes for the photo; the parent frame must be `relative overflow-hidden`. */
  className?: string;
}

/**
 * Fills its frame with object-cover when the photo's shape is close to the
 * frame's; otherwise shows the whole photo with a blurred copy behind it.
 */
export function ChildPhoto({ src, alt, className }: ChildPhotoProps) {
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  // Called from both the ref and onLoad: with SSR the image can finish loading
  // before hydration, in which case onLoad never fires.
  const updateFit = useCallback((img: HTMLImageElement | null) => {
    if (!img?.complete || !img.naturalWidth || !img.clientHeight) return;
    const imageRatio = img.naturalWidth / img.naturalHeight;
    const frameRatio = img.clientWidth / img.clientHeight;
    const mismatch =
      Math.max(imageRatio, frameRatio) / Math.min(imageRatio, frameRatio);
    setFit(mismatch <= 1 + COVER_RATIO_TOLERANCE ? "cover" : "contain");
  }, []);

  // The frame's shape changes across breakpoints, so re-check on resize.
  const observeFrame = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;
      updateFit(img);
      const observer = new ResizeObserver(() => updateFit(img));
      observer.observe(img);
      return () => observer.disconnect();
    },
    [updateFit],
  );

  return (
    <>
      {fit === "contain" && (
        // Blurred copy of the same (cached) image fills the letterbox space.
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover blur-md scale-110"
        />
      )}
      <img
        ref={observeFrame}
        onLoad={(e) => updateFit(e.currentTarget)}
        src={src}
        alt={alt}
        className={cn(
          "relative w-full",
          fit === "cover" ? "object-cover" : "object-contain",
          className,
        )}
      />
    </>
  );
}
