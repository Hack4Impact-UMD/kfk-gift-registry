import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ThankYouNoteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onSend: (note: string) => void;
  isPending?: boolean;
  errorMessage?: string;
};

export function ThankYouNoteModal({
  open,
  onOpenChange,
  note,
  onNoteChange,
  onSend,
  isPending = false,
  errorMessage,
}: ThankYouNoteModalProps) {
  const trimmedNote = note.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-2 border-kfk-blue shadow-xl rounded-xl p-6 w-[331px] flex flex-col">
        <p className="text-sm my-4">
          <span className="font-semibold">Optional:</span> Write a thank you
          note to your donor
        </p>

        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Thank you donor for..."
          className="min-h-[140px] resize-none"
        />

        {errorMessage ? (
          <p className="mt-3 text-sm text-kfk-red">{errorMessage}</p>
        ) : null}

        <div className="flex justify-end mt-4">
          <Button
            onClick={() => onSend(trimmedNote)}
            className="bg-kfk-blue text-white"
            disabled={isPending || trimmedNote.length === 0}
          >
            {isPending ? "Sending..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
