import type { Gift } from "common";
import { GiftIcon } from "@/components/icons/GiftIcon";
import { InformationCircleOutlineIcon } from "@/components/icons/InformationCircleOutlineIcon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EditableField } from "./EditableField";

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
  return (
    <div className={cn("border-b border-slate-200/80 py-3 last:border-b-0")}>
      <div className="grid grid-cols-[0px_minmax(0,1fr)_auto_auto] items-start gap-x-2 gap-y-2">
        

        <div className="flex gap-2 col-start-2 row-start-1 min-w-0">
          <GiftIcon
          className="size-6 shrink-0 my-auto text-foreground"
          aria-hidden
        />
          <EditableField
            value={gift.title}
            editable={editable}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              onTitleChange(e.target.value);
            }}
          ></EditableField>
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
          {editable && (
            <EditableField
              placeholder="Gift Notes"
              value={gift.familyPublicNotes}
              fieldType="textarea"
              editable={editable}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onNotesChange(e.target.value);
              }}
            ></EditableField>
          )}
        </div>
      </div>
    </div>
  );
}
