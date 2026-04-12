import type { Gift } from "common";
import { GiftIcon } from "@/components/icons/GiftIcon";
import { InformationCircleOutlineIcon } from "@/components/icons/InformationCircleOutlineIcon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ReviewGiftProps {
  gift: Gift;
  editable: boolean;
  onTitleChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

function formatPrice(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "";
  return String(value);
}

const fieldBoxClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs";

export function ReviewGift({
  gift,
  editable,
  onTitleChange,
  onPriceChange,
  onNotesChange,
}: ReviewGiftProps) {
  const notes = gift.privateNotes ?? "";

  return (
    <div className={cn("border-b border-slate-200/80 py-3 last:border-b-0")}>
      <div className="grid grid-cols-[24px_minmax(0,1fr)_auto_auto] items-start gap-x-2 gap-y-2">
        <GiftIcon
          className="col-start-1 row-span-2 size-6 shrink-0 self-start text-foreground"
          aria-hidden
        />

        <div className="col-start-2 row-start-1 min-w-0">
          {editable ? (
            <Input
              value={gift.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={cn(fieldBoxClass, "border-foreground")}
            />
          ) : (
            <div
              className={cn(fieldBoxClass, "flex items-center")}
              title={gift.title}
            >
              <span className="min-w-0 truncate">{gift.title}</span>
            </div>
          )}
        </div>

        <InformationCircleOutlineIcon
          className="col-start-3 row-start-1 size-6 shrink-0 self-center text-muted-foreground"
          aria-hidden
        />

        <div className="col-start-4 row-start-1 flex shrink-0 items-center gap-1 self-center">
          <span className="text-foreground tabular-nums">$</span>
          <Input
            type="text"
            inputMode="decimal"
            value={formatPrice(gift.listedPrice)}
            onChange={(e) => onPriceChange(e.target.value)}
            className="h-9 w-[5.5rem] bg-background shadow-xs"
          />
        </div>

        <div className="col-start-2 row-start-2 min-w-0">
          {editable ? (
            <Input
              placeholder="Gift notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className={cn(
                fieldBoxClass,
                "border-foreground text-black placeholder:text-muted-foreground",
              )}
            />
          ) : (
            <div
              className={cn(fieldBoxClass, "flex items-center text-black")}
              title={notes || undefined}
            >
              <span className="min-w-0 truncate">
                {notes.length > 0 ? notes : "—"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
