import { Gift as GiftIcon } from "lucide-react";
import { GiftInfoCard } from "./GiftInfoCard";
import { ParentComments } from "./ParentComments";
import { AdminComments } from "./AdminComments";
import { FamilyAccountLink } from "./FamilyAccountLink";
import type { Gift } from "common";

interface GiftInfoSectionProps {
  gifts: Gift[];
  parentComments?: string;
  adminComments?: string;
  familyToken: string;
  onUpdateGift?: (giftId: string, updates: Partial<Gift>) => void;
  onSaveAdminComments?: (comments: string) => void;
}

export function GiftInfoSection({
  gifts,
  parentComments,
  adminComments,
  familyToken,
  onUpdateGift,
  onSaveAdminComments,
}: GiftInfoSectionProps) {
  const activeGifts = gifts.filter((g) => g.active);
  const backupGifts = gifts.filter((g) => !g.active);

  return (
    <div className="grid grid-cols-[1fr_320px] gap-8 mt-4 items-start">
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <GiftIcon className="h-6 w-6" />
            Main Gift Information
          </h2>
          {activeGifts.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No active gifts.</p>
          ) : (
            activeGifts.map((gift) => (
              <GiftInfoCard
                key={gift.id}
                gift={gift}
                // TODO: wire donor/tracking/date fields from backend claims data
                onUpdate={onUpdateGift}
              />
            ))
          )}
        </div>

        {/* Backup gifts */}
        {backupGifts.length > 0 && (
          <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <GiftIcon className="h-6 w-6" />
              Backup Gift Information
            </h2>
            {backupGifts.map((gift) => (
              <GiftInfoCard
                key={gift.id}
                gift={gift}
                onUpdate={onUpdateGift}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right column: comments + family link */}
      <div className="flex flex-col gap-4 sticky top-4">
        <ParentComments comments={parentComments} />
        <AdminComments
          initialComments={adminComments ?? ""}
          onSave={onSaveAdminComments ?? (() => {})}
        />
        <FamilyAccountLink familyToken={familyToken} />
      </div>
    </div>
  );
}