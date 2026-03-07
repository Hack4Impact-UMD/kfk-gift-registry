import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmGiftModal({ open, onOpenChange }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative flex flex-col items-center border-2 border-kfk-blue bg-white shadow-xl rounded-xl p-6 w-[313px] z-10">

        <Button
          onClick={() => onOpenChange(false)}
          variant={"ghost"}
          className="absolute top-4 right-4"
        >
          <X size={20} />
        </Button>

        <p className="my-6">
          Are you sure you received the gift?
        </p>

        <Button 
            className="bg-kfk-blue font-gaegu text-white px-4 py-2 rounded"
            onClick={() => onOpenChange(false)}
        >
          Yes, I got the gift!
        </Button>

      </div>
    </div>
  )
}