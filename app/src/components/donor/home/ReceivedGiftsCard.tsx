import type { CommittedGift, GiftFormState } from "./types";
import { ThankYouNotePanel } from "./ThankYouNotePanel";

export function ReceivedGiftsCard({
  gifts,
  giftStates,
  childFirstName,
}: {
  gifts: Array<CommittedGift>;
  giftStates: Record<string, GiftFormState>;
  childFirstName: string;
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
          <div key={g.id} className="space-y-3">
            <div className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 text-sm">
              <span className="font-bold">Gift Name:</span>
              <span>{g.title}</span>
            </div>
            {g.thankYouNote ? (
              <ThankYouNotePanel
                note={g.thankYouNote}
                childFirstName={childFirstName}
              />
            ) : null}
          </div>
        ))}
        <p className="pt-2 text-center font-bold italic text-gray-800">
          Thank you for your contribution!
        </p>
      </div>
    </div>
  );
}
