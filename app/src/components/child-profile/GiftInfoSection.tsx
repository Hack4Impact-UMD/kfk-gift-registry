import { Gift as GiftIcon } from "lucide-react";
import { GiftInfoCard } from "./GiftInfoCard";
import { ParentComments } from "./ParentComments";
import { AdminComments } from "./AdminComments";
import { FamilyAccountLink } from "./FamilyAccountLink";
import type { Gift } from "common";

export type GiftDetails = {
  donorName: string;
  donorEmail: string;
  trackingId: string;
  dateOrdered: string;
  dateDelivered: string;
  dateReceived: string;
  proofOfPurchaseUrl?: string;
};

interface GiftInfoSectionProps {
  gifts: Gift[];
  parentComments?: string;
  adminComments?: string;
  familyToken: string;
  giftDetailsByGiftId?: Record<string, GiftDetails>;
  onUpdateGiftDetails?: (giftId: string, details: GiftDetails) => void;
  onUpdateGift?: (giftId: string, updates: Partial<Gift>) => void;
  onSaveAdminComments?: (comments: string) => void;
}

export function GiftInfoSection({
  gifts,
  parentComments,
  adminComments,
  familyToken,
  giftDetailsByGiftId = {},
  onUpdateGiftDetails,
  onUpdateGift,
  onSaveAdminComments,
}: GiftInfoSectionProps) {
  const activeGifts = gifts.filter((g) => g.active);
  const backupGifts = gifts.filter((g) => !g.active);

  return (
    <div className="grid grid-cols-[minmax(0,900px)_420px] gap-12 mt-6 items-start justify-start">
      <div className="flex flex-col gap-6 min-w-0">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-4">
          <h2 className="text-4xl font-bold flex items-center justify-center gap-3 pt-3 -mb-3">
            <GiftIcon className="h-10 w-10 shrink-0" />
            <span className="leading-none">Main Gift Information</span>
          </h2>
          {activeGifts.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No active gifts.</p>
          ) : (
            activeGifts.map((gift) => (
              <GiftInfoCard
                key={gift.id}
                gift={gift}
                isBackupGift={false}
                donorName={giftDetailsByGiftId[gift.id]?.donorName}
                donorEmail={giftDetailsByGiftId[gift.id]?.donorEmail}
                trackingId={giftDetailsByGiftId[gift.id]?.trackingId}
                dateOrdered={giftDetailsByGiftId[gift.id]?.dateOrdered}
                dateDelivered={giftDetailsByGiftId[gift.id]?.dateDelivered}
                dateReceived={giftDetailsByGiftId[gift.id]?.dateReceived}
                proofOfPurchaseUrl={giftDetailsByGiftId[gift.id]?.proofOfPurchaseUrl}
                onUpdate={onUpdateGift}
                onUpdateDetails={onUpdateGiftDetails}
              />
            ))
          )}
        </div>

        {/* Backup gifts */}
        {backupGifts.length > 0 && (
          <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <h2 className="text-4xl font-bold flex items-center justify-center gap-3 pt-3 -mb-3">
              <GiftIcon className="h-10 w-10 shrink-0" />
              <span className="leading-none">Backup Gift Information</span>
            </h2>
            {backupGifts.map((gift) => (
              <GiftInfoCard
                key={gift.id}
                gift={gift}
                isBackupGift
                donorName={giftDetailsByGiftId[gift.id]?.donorName}
                donorEmail={giftDetailsByGiftId[gift.id]?.donorEmail}
                trackingId={giftDetailsByGiftId[gift.id]?.trackingId}
                dateOrdered={giftDetailsByGiftId[gift.id]?.dateOrdered}
                dateDelivered={giftDetailsByGiftId[gift.id]?.dateDelivered}
                dateReceived={giftDetailsByGiftId[gift.id]?.dateReceived}
                proofOfPurchaseUrl={giftDetailsByGiftId[gift.id]?.proofOfPurchaseUrl}
                onUpdate={onUpdateGift}
                onUpdateDetails={onUpdateGiftDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right column: comments + family link */}
      <div className="flex flex-col gap-6 sticky top-4 w-full max-w-[420px]">
        <div className="bg-transparent flex flex-col gap-6">
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