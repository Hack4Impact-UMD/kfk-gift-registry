import { useState } from "react";
import type { Gift } from "common";
import { compareGiftOrder } from "common";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { PencilSquare } from "../icons/PencilSquare";
import { GiftForm } from "./GiftForm";

export const MAX_STOREFRONT_GIFTS = 3;

type SelectedGiftsProps = {
  gifts: ReadonlyArray<Gift>;
  isEditing: boolean;
  isSaving?: boolean;
  onStartEditing: () => void;
  onSave: () => void;
  onCancel: () => void;
  onBackupToggle: (giftId: string) => void;
  onMoveGift: (giftId: string, direction: "up" | "down") => void;
  onEditGift: (
    giftId: string,
    gift: {
      title: string;
      productUrl: string;
      listedPrice?: number;
      familyPublicNotes?: string;
    },
  ) => Promise<void>;
  isSavingGiftEdit?: boolean;
  headerAction?: React.ReactNode;
};

export function SelectedGifts({
  gifts,
  isEditing,
  isSaving = false,
  onStartEditing,
  onSave,
  onCancel,
  onBackupToggle,
  onMoveGift,
  onEditGift,
  isSavingGiftEdit = false,
  headerAction,
}: SelectedGiftsProps) {
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const sortedGifts = [...gifts].sort(compareGiftOrder);
  const mainGifts = sortedGifts.filter((g) => !g.backup);
  const backupGifts = sortedGifts.filter((g) => g.backup);
  const isStorefrontFull = mainGifts.length >= MAX_STOREFRONT_GIFTS;

  const editingGift = gifts.find((g) => g.id === editingGiftId);

  const handleEditSubmit = async (gift: {
    title: string;
    productUrl: string;
    listedPrice?: number;
    familyPublicNotes?: string;
  }) => {
    if (!editingGiftId) return;
    const giftIdBeingEdited = editingGiftId;
    await onEditGift(giftIdBeingEdited, gift);
    setEditingGiftId((current) =>
      current === giftIdBeingEdited ? null : current,
    );
  };

  const renderGiftRow = (
    gift: Gift,
    index: number,
    group: ReadonlyArray<Gift>,
  ) => {
    const isBackup = gift.backup;
    const label = isBackup ? `Backup Gift ${index + 1}` : `Gift ${index + 1}`;
    const isPromotionBlocked = isBackup && isStorefrontFull;

    return (
      <div
        key={gift.id}
        className={`flex flex-col gap-3 border-l-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
          isBackup ? "border-l-border bg-muted/40" : "border-l-kfk-blue"
        }`}
      >
        <div className="flex min-w-0 items-start gap-3">
          {isEditing && (
            <div className="flex shrink-0 flex-col">
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Move ${label} up`}
                disabled={isSaving || index === 0}
                onClick={() => onMoveGift(gift.id, "up")}
              >
                <ChevronUp className="size-4" aria-hidden />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Move ${label} down`}
                disabled={isSaving || index === group.length - 1}
                onClick={() => onMoveGift(gift.id, "down")}
              >
                <ChevronDown className="size-4" aria-hidden />
              </Button>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words text-sm font-semibold">{label}</p>
              <span
                className={
                  isBackup
                    ? "rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    : "rounded-full border border-kfk-blue bg-kfk-light-blue/25 px-2 py-0.5 text-xs font-medium text-kfk-blue"
                }
              >
                {isBackup ? "Backup" : "Main"}
              </span>
            </div>
            <a
              href={gift.productUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`break-words text-sm underline-offset-2 hover:underline ${
                isBackup ? "text-muted-foreground" : "text-kfk-blue"
              }`}
            >
              {gift.title}
            </a>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center">
          {isEditing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBackupToggle(gift.id)}
              disabled={isSaving || isPromotionBlocked}
              title={
                isPromotionBlocked
                  ? `Move a main gift to backup first. Children can have ${MAX_STOREFRONT_GIFTS} main gifts.`
                  : undefined
              }
            >
              {isBackup ? "Make main" : "Move to backup"}
            </Button>
          ) : (
            <span
              className={
                gift.status === "RECEIVED"
                  ? "rounded-full border border-transparent bg-kfk-muted-green/40 px-5 py-1 text-xs font-medium text-kfk-green"
                  : "rounded-full border border-transparent bg-kfk-muted-red/40 px-4 py-1 text-xs font-medium text-kfk-red"
              }
            >
              {gift.status === "RECEIVED" ? "Received" : "Not Received"}
            </span>
          )}

          <Dialog
            open={editingGiftId === gift.id}
            onOpenChange={(open) => setEditingGiftId(open ? gift.id : null)}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Edit details
              </Button>
            </DialogTrigger>
            {editingGift && editingGift.id === gift.id && (
              <GiftForm
                mode="edit"
                initial={editingGift}
                isSubmitting={isSavingGiftEdit}
                onSubmit={handleEditSubmit}
              />
            )}
          </Dialog>
        </div>
      </div>
    );
  };

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Main Gifts ({mainGifts.length} of {MAX_STOREFRONT_GIFTS})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                className="min-w-20 px-4"
                disabled={isSaving}
                onClick={onSave}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="min-w-20 px-4"
                disabled={isSaving}
                onClick={onCancel}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={onStartEditing}>
                <PencilSquare className="size-4" aria-hidden />
                Edit gifts
              </Button>
              {headerAction}
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Use the arrows to change the order donors see main gifts in.</li>
          <li>
            Use Move to backup and Make main to choose which gifts donors see. A
            child can have up to {MAX_STOREFRONT_GIFTS} main gifts.
          </li>
          <li>Save to apply your changes, or Cancel to discard them.</li>
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Donors see this child&apos;s main gifts on the storefront, in the
          order listed here. Backup gifts are hidden from donors until you make
          them main. Select Edit gifts to reorder gifts or change which ones are
          main, or Edit details to update a gift&apos;s name, link, price, or
          notes.
        </p>
      )}

      <div className="w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="divide-y divide-border/70">
          {mainGifts.length === 0 ? (
            <p className="px-4 py-3 text-sm italic text-muted-foreground">
              No main gifts yet.
              {backupGifts.length > 0 && isEditing
                ? " Make a backup gift main."
                : ""}
            </p>
          ) : (
            mainGifts.map(renderGiftRow)
          )}
        </div>

        {backupGifts.length > 0 && (
          <>
            <div className="flex items-center gap-3 border-t-2 border-dashed border-border px-4 pt-3 pb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Backup gifts ({backupGifts.length})
              </h3>
            </div>
            <div className="divide-y divide-border/70">
              {backupGifts.map(renderGiftRow)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
