import ladybug from "@/assets/ladybug-success.png";

export function DonorNotificationsEmptyState() {
  return (
    <div className="flex flex-col items-center px-6 pt-10 text-center">
      <h2 className="font-gaegu text-[34px] font-bold leading-tight text-[#173B8F]">
        Nothing to See Yet!
      </h2>
      <p className="mt-3 text-[18px] text-[#6B7280]">
        New Notifications will appear here.
      </p>

      <div className="relative mt-10 h-[520px] w-full max-w-[320px] overflow-hidden">
        <img
          src={ladybug}
          alt="Ladybug"
          className="absolute left-1/2 top-0 z-10 h-[320px] w-[320px] -translate-x-1/2 -rotate-90 object-contain"
        />
      </div>
    </div>
  );
}
