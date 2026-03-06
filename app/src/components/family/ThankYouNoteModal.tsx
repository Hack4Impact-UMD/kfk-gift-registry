import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ThankYouNoteModal({ open, onOpenChange }: Props) {
  const [note, setNote] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative bg-card shadow-xl rounded-xl p-6 w-[420px] z-10 flex flex-col">

        <Button
          onClick={() => onOpenChange(false)}
          variant={"ghost"}
          className="absolute top-4 right-4"
        >
          <X size={20} />
        </Button>

        <p className="text-sm my-4">
          <span className="font-semibold">Optional:</span> Write a thank you note to your donor
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

      </div>
    </div>
  );
}