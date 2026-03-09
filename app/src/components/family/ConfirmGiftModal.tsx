import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmGiftModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmGiftModal({ open, onOpenChange }: ConfirmGiftModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center border-2 border-kfk-blue bg-card shadow-xl rounded-xl p-6 w-[313px]">

        <p className="my-6 text-center">
          Are you sure you received the gift?
        </p>

        <Button
          className="bg-kfk-blue font-gaegu text-white px-4 py-2 rounded"
          onClick={() => onOpenChange(false)}
        >
          Yes, I got the gift!
        </Button>

      </DialogContent>
    </Dialog>
  )
}