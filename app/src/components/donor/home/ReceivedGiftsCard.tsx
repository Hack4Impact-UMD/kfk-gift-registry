import type { CommittedGift, GiftFormState } from "./types";

export function ReceivedGiftsCard({
  gifts,
  giftStates,
}: {
  gifts: Array<CommittedGift>;
  giftStates: Record<string, GiftFormState>;
}) {
  const received = gifts.filter((g) => giftStates[g.id]?.receivedByFamily);
  if (received.length === 0) return null;
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="space-y-3 p-5">
        <p className="border-b-1 border-b-[#126912] border-t-1 border-t-[#126912] py-2 -mx-5 text-center font-semibold text-[#126912] bg-green-100">
          The family received your gift(s).
        </p>
        {received.map((g) => (
          <div
            key={g.id}
            className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 text-sm"
          >
            <span className="font-bold">Gift Name:</span>
            <span>{g.title}</span>
          </div>
        ))}
        <p className="pt-2 text-center font-bold italic text-gray-800">
          Thank you for your contribution!
        </p>
      </div>
    </div>
  );
}
