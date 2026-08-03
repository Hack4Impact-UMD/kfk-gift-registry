type StorefrontDriveProgressBarProps = {
  progressPercentage: number;
  ladybugPosition: number;
  ladybugSrc: string;
};

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
            className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2"
            style={{
              width: `${progressPercentage}%`,
              backgroundImage:
                "repeating-linear-gradient(to right, #1f1f1f 0 8px, transparent 8px 14px)",
            }}
          />
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
