import { useState } from "react";
import {
  GIFT_PRIVATE_NOTES_TOO_LONG_MESSAGE,
  MAX_GIFT_PRIVATE_NOTES_LENGTH,
} from "common";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PencilSquare } from "@/components/icons/PencilSquare";
import { useUpdateGiftPrivateNotes } from "@/hooks/mutations/useStaffClaim";

type GiftNotesCellProps = {
  giftId: string;
  giftName: string;
  notes: string | undefined;
};

/** Staff-only private notes for a gift, editable in place via a popover. */
export function GiftNotesCell({ giftId, giftName, notes }: GiftNotesCellProps) {
  const savedNotes = notes ?? "";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(savedNotes);
  const updateNotes = useUpdateGiftPrivateNotes();

  const tooLong = draft.length > MAX_GIFT_PRIVATE_NOTES_LENGTH;
  const unchanged = draft.trim() === savedNotes;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Re-seed the draft from the saved value each time the editor opens.
        if (next) setDraft(savedNotes);
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Edit notes for ${giftName}`}
          className="group flex w-full items-center gap-2 text-left cursor-pointer"
        >
          <span
            className="text-sm text-gray-600 font-sans truncate"
            title={savedNotes || undefined}
          >
            {savedNotes || <span className="text-gray-400">Add note</span>}
          </span>
          <PencilSquare className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-gray-900 transition-colors" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 space-y-2"
        onClick={(e) => e.stopPropagation()}
      >
        <label
          htmlFor={`gift-notes-${giftId}`}
          className="text-sm font-semibold"
        >
          Private Notes
        </label>
        <Textarea
          id={`gift-notes-${giftId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Visible to staff only"
          disabled={updateNotes.isPending}
          aria-invalid={tooLong}
          className="max-h-60"
        />
        {tooLong && (
          <p className="text-xs text-destructive">
            {GIFT_PRIVATE_NOTES_TOO_LONG_MESSAGE}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={updateNotes.isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={updateNotes.isPending || unchanged || tooLong}
            onClick={() =>
              updateNotes.mutate(
                { giftId, privateNotes: draft },
                { onSuccess: () => setOpen(false) },
              )
            }
          >
            {updateNotes.isPending ? <Spinner /> : "Save"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
