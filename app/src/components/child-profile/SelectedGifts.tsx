import { useState } from "react";
import type { Gift } from "common";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { GiftForm } from "./GiftForm";

type SelectedGiftsProps = {
  gifts: ReadonlyArray<Gift>;
  isEditing: boolean;
  onGiftToggle: (giftId: string) => void;
  onEditGift: (
    giftId: string,
    gift: { title: string; productUrl: string; listedPrice?: number },
  ) => Promise<void>;
  isSavingGiftEdit?: boolean;
  headerAction?: React.ReactNode;
};

export function SelectedGifts({
  gifts,
  isEditing,
  onGiftToggle,
  onEditGift,
  isSavingGiftEdit = false,
  headerAction,
}: SelectedGiftsProps) {
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const activeGifts = gifts.filter((g) => g.active);
  const inactiveGifts = gifts.filter((g) => !g.active);

  const visibleGifts = isEditing
    ? [...activeGifts, ...inactiveGifts]
    : activeGifts;

  const editingGift = gifts.find((g) => g.id === editingGiftId);

  const handleEditSubmit = async (gift: {
    title: string;
    productUrl: string;
    listedPrice?: number;
  }) => {
    if (!editingGiftId) return;
    const giftIdBeingEdited = editingGiftId;
    await onEditGift(giftIdBeingEdited, gift);
    setEditingGiftId((current) =>
      current === giftIdBeingEdited ? null : current,
    );
  };

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Storefront Selected Gifts (3 Max)
        </h2>
        {headerAction}
      </div>

      <div className="w-full divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        {visibleGifts.map((gift, i) => {
          const isActive = gift.active;

          const index = isActive
            ? activeGifts.indexOf(gift) + 1
            : inactiveGifts.indexOf(gift) + 1;

          const label = isActive ? `Gift ${index}` : `Backup Gift ${index}`;

          return (
            <div
              key={gift.id ?? i}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                {isEditing && (
                  <Input
                    type="checkbox"
                    checked={gift.active}
                    onChange={() => onGiftToggle(gift.id)}
                    disabled={!gift.active && activeGifts.length >= 3}
                    className="mt-1 size-5 shrink-0"
                  />
                )}

                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">{label}</p>
                  <a
                    href={gift.productUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-sm text-kfk-blue underline-offset-2 hover:underline"
                  >
                    {gift.title}
                  </a>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-start">
                {!isEditing && (
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
                  onOpenChange={(open) =>
                    setEditingGiftId(open ? gift.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Edit
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
        })}
      </div>
    </div>
  );
}
