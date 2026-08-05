import LadybugFootprints from "@/assets/ladybug-footprints.svg";

type StorefrontDriveProgressBarProps = {
  progressPercentage: number;
  ladybugPosition: number;
  ladybugSrc: string;
};

const trailMaskStyle = {
  WebkitMaskImage: `url(${LadybugFootprints})`,
  maskImage: `url(${LadybugFootprints})`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "left center",
  maskPosition: "left center",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
} as const;

export function StorefrontDriveProgressBar({
  progressPercentage,
  ladybugPosition,
  ladybugSrc,
}: StorefrontDriveProgressBarProps) {
  return (
    <div className="relative">
      <div className="h-[2.2rem] w-full rounded-full border-[3px] border-[#F6E7A8] bg-[#FFF4BF] px-3 shadow-inner md:h-[2.35rem] md:px-4">
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${progressPercentage}%` }}
          >
            <div
              className="absolute left-0 top-1/2 h-5 w-full -translate-y-1/2 bg-[#FACC15] opacity-90 blur-[2px]"
              style={trailMaskStyle}
            />
            <div
              className="absolute left-0 top-1/2 h-4 w-full -translate-y-1/2 bg-[#1F1F1F]"
              style={trailMaskStyle}
            />
          </div>
        </div>
      </div>

      <div
        className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${ladybugPosition}%` }}
      >
        <img
          src={ladybugSrc}
          alt="ladybug"
          className="h-9 w-9 max-w-none md:h-10 md:w-10"
        />
      </div>
    </div>
  );
}
