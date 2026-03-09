import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ThankYouNoteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ThankYouNoteModal({
  open,
  onOpenChange,
}: ThankYouNoteModalProps) {
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-2 border-kfk-blue shadow-xl rounded-xl p-6 w-[331px] flex flex-col">
        <p className="text-sm my-4">
          <span className="font-semibold">Optional:</span> Write a thank you
          note to your donor
        </p>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thank you donor for..."
          className="min-h-[140px] resize-none"
        />

        <div className="flex justify-end mt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-kfk-blue text-white"
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
