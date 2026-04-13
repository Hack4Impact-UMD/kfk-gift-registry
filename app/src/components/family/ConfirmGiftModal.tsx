import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmGiftModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  errorMessage?: string;
};

export function ConfirmGiftModal({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  errorMessage,
}: ConfirmGiftModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center border-2 border-kfk-blue bg-card shadow-xl rounded-xl p-6 w-[313px]">
        <p className="my-6 text-center">Are you sure you received the gift?</p>

        {errorMessage ? (
          <p className="mb-4 text-center text-sm text-kfk-red">
            {errorMessage}
          </p>
        ) : null}

        <Button
          className="bg-kfk-blue font-gaegu text-white px-4 py-2 rounded"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "Updating..." : "Yes, I got the gift!"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
