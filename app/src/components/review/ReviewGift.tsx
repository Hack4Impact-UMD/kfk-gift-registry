import type { Gift } from "common";
import { GiftIcon } from "@/components/icons/GiftIcon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EditableField } from "./EditableField";
import { useEffect, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";
import {
  MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH,
  MAX_GIFT_TITLE_LENGTH,
} from "common";

export interface ReviewGiftProps {
  gift: Gift;
  editable: boolean;
  onTitleChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onProductUrlChange: (value: string) => void;
}

function formatPrice(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(value);
}

export function ReviewGift({
  gift,
  editable,
  onTitleChange,
  onPriceChange,
  onNotesChange,
  onProductUrlChange,
}: ReviewGiftProps) {
  const [priceStr, setPriceStr] = useState(formatPrice(gift.listedPrice));
  useEffect(() => {
    //oxlint-disable
    setPriceStr(formatPrice(gift.listedPrice));
  }, [gift.listedPrice]);
  return (
    <div className={cn("border-b border-slate-200/80 py-3 last:border-b-0")}>
      <div className="grid grid-cols-[0px_minmax(0,1fr)_auto_auto] items-start gap-x-2 gap-y-2">
        <div className="flex gap-2 col-start-2 row-start-1 min-w-0">
          <GiftIcon
            className="size-6 shrink-0 my-auto text-foreground"
            aria-hidden
          />

          {editable ? (
            <EditableField
              value={gift.title}
              editable={editable}
              characterLimit={MAX_GIFT_TITLE_LENGTH}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onTitleChange(e.target.value);
              }}
            />
          ) : gift.productUrl ? (
            <a
              href={gift.productUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="min-w-0 truncate text-blue-600 hover:underline"
            >
              {gift.title}
            </a>
          ) : (
            <span className="min-w-0 truncate text-muted-foreground">
              {gift.title}
            </span>
          )}
        </div>

        {gift.productUrl && (
          <a
            href={gift.productUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="col-start-3 row-start-1 size-7 shrink-0 self-center text-muted-foreground"
          >
            <ExternalLinkIcon aria-hidden />
          </a>
        )}

        <div className="col-start-4 row-start-1 flex shrink-0 items-center gap-1 self-center">
          <span className="text-foreground tabular-nums">$</span>
          <Input
            type="text"
            inputMode="decimal"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
            onBlur={(e) => onPriceChange(e.target.value)}
            className="h-9 w-[5.5rem] bg-background shadow-xs"
          />
        </div>

        {editable && (
          <div className="col-start-2 row-start-2 min-w-0">
            <Input
              type="url"
              placeholder="Gift Link"
              value={gift.productUrl}
              onChange={(e) => onProductUrlChange(e.target.value)}
              className="w-full min-w-0 border-foreground"
            />
          </div>
        )}

        <div className="col-start-2 row-start-3 min-w-0">
          {editable ? (
            <EditableField
              placeholder="Gift Notes"
              value={gift.familyPublicNotes}
              fieldType="textarea"
              editable={editable}
              characterLimit={MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                onNotesChange(e.target.value);
              }}
            ></EditableField>
          ) : (
            <span className="text-muted-fg text-sm">
              {gift.familyPublicNotes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
