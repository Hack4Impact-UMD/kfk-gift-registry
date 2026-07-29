import { Card } from "@/components/ui/card";
import { ThankYouNotePanel } from "./ThankYouNotePanel";
import type { CommittedGift } from "./types";

export function ReceivedSummaryCard({
  gifts,
  childFirstName,
}: {
  gifts: Array<CommittedGift>;
  childFirstName: string;
}) {
  return (
    <Card className="overflow-hidden rounded-[10px] border border-[#CFCFCF] bg-white shadow-none">
      <div className="border-y border-[#8BC34A] bg-[#E8F7E8] px-3 py-2 text-center text-[14px] text-[#2E7D32]">
        The family received your gift(s).
      </div>
      <div className="space-y-3 px-3 py-3">
        {gifts.map((gift) => (
          <div key={gift.id} className="space-y-2">
            <div className="grid grid-cols-[56px_1fr] gap-2 text-[14px]">
              <span>Gift Name:</span>
              <span>{gift.title}</span>
            </div>
            {gift.thankYouNote ? (
              <ThankYouNotePanel
                note={gift.thankYouNote}
                childFirstName={childFirstName}
              />
            ) : null}
          </div>
        ))}
        <p className="pt-1 text-center text-[14px] font-semibold italic text-[#1F2937]">
          Thank you for your contribution!
        </p>
      </div>
    </Card>
  );
}
