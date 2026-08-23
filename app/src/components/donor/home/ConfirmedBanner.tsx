export function ConfirmedBanner({ label }: { label: string }) {
  return (
    <div className="flex w-full justify-center">
      <div className="flex min-h-12 w-full max-w-lg items-center justify-center gap-3 rounded-xl bg-kfk-green px-4 py-2 font-gaegu text-[20px] font-bold text-white">
        <span className="whitespace-nowrap">{label}</span>
        <span className="shrink-0">✓</span>
      </div>
    </div>
  );
}
