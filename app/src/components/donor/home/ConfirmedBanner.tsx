export function ConfirmedBanner({ label }: { label: string }) {
  return (
    <div className="flex w-full justify-center">
      <div className="flex min-h-12 w-[92%] max-w-md flex-wrap items-center justify-center gap-2 rounded-xl bg-kfk-green px-3 py-2 font-gaegu text-[20px] font-bold text-white">
        <span>{label}</span>
        <span>✓</span>
      </div>
    </div>
  );
}
