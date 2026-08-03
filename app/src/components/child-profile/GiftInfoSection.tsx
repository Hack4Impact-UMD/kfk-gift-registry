import { Gift as GiftIcon } from "lucide-react";
import type { Gift } from "common";
import type { GiftClaimDetails } from "@/server/functions/child";
import { GiftInfoCard } from "./GiftInfoCard";
import { ParentComments } from "./ParentComments";
import { AdminComments } from "./AdminComments";
import { FamilyAccountLink } from "./FamilyAccountLink";

interface GiftInfoSectionProps {
  gifts: ReadonlyArray<Gift>;
  claimsByGiftId?: Record<string, GiftClaimDetails>;
  parentComments?: string;
  adminComments?: string;
  familyToken?: string;
  onSaveAdminComments?: (comments: string) => void | Promise<void>;
}

export function GiftInfoSection({
  gifts,
  claimsByGiftId = {},
  parentComments,
  adminComments,
  familyToken,
  onSaveAdminComments,
}: GiftInfoSectionProps) {
  const activeGifts = gifts.filter((g) => g.active);
  const backupGifts = gifts.filter((g) => !g.active);

  return (
    <div className="w-full mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="flex flex-col items-start gap-3 pt-3 text-2xl font-bold leading-tight sm:flex-row sm:items-center sm:justify-center sm:text-3xl lg:text-4xl">
            <GiftIcon className="h-10 w-10 shrink-0" />
            <span className="leading-none">Main Gift Information</span>
          </h2>
          {activeGifts.length === 0 ? (
            <p className="text-sm italic text-gray-400">No active gifts.</p>
          ) : (
            activeGifts.map((gift) => (
              <GiftInfoCard
                key={gift.id}
                gift={gift}
                isBackupGift={false}
                claim={claimsByGiftId[gift.id]}
              />
            ))
          )}
        </div>

        {backupGifts.length > 0 && (
          <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm">
            <h2 className="flex flex-col items-start gap-3 pt-3 text-2xl font-bold leading-tight sm:flex-row sm:items-center sm:justify-center sm:text-3xl lg:text-4xl">
              <GiftIcon className="h-10 w-10 shrink-0" />
              <span className="leading-none">Backup Gift Information</span>
            </h2>
            {backupGifts.map((gift) => (
              <GiftInfoCard
                key={gift.id}
                gift={gift}
                isBackupGift
                claim={claimsByGiftId[gift.id]}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex min-w-0 w-full flex-col gap-6 xl:sticky xl:top-4">
        <div className="flex flex-col gap-6 bg-transparent">
          <ParentComments comments={parentComments} />

          <AdminComments
            initialComments={adminComments ?? ""}
            onSave={onSaveAdminComments ?? (() => {})}
          />

          <div className="pt-2">
            <FamilyAccountLink familyToken={familyToken} />
          </div>
        </div>
      </div>
    </div>
  );
}
