import RedGift from "@/assets/red-gift.png";

export function WelcomeBanner({ displayName }: { displayName: string }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-[#173FB6] px-5 py-5 text-white shadow-[0_8px_24px_rgba(23,63,182,0.22)] md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute left-10 top-[-10px] h-16 w-16 rounded-full bg-[#4D7CFE]" />
        <div className="absolute left-28 top-8 h-20 w-20 rounded-full bg-[#4D7CFE]" />
        <div className="absolute right-20 top-2 h-16 w-16 rounded-full bg-[#4D7CFE]" />
        <div className="absolute right-6 bottom-4 h-14 w-14 rounded-full bg-[#4D7CFE]" />
      </div>

      <div className="relative flex items-center justify-between gap-4 md:gap-6">
        <div className="min-w-0 max-w-[280px] md:max-w-[420px]">
          <h1 className="font-gaegu text-[28px] font-bold leading-[1.15] tracking-[0.02em] text-white md:max-w-[360px] md:text-[34px]">
            Welcome {displayName}!
          </h1>
          <p className="mt-3 max-w-[280px] text-[16px] italic leading-6 text-white/95 md:max-w-[420px] md:text-[18px] md:leading-8">
            Your Contribution Makes a Difference. Thank You for your support!
          </p>
        </div>

        <div className="flex shrink-0 justify-center md:pr-4">
          <img src={RedGift} alt="Gift" className="w-24 md:w-28" />
        </div>
      </div>
    </div>
  );
}
