import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmGiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmGiftsModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmGiftsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-normal">
            Are you sure you can commit to buying these gifts?
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full text-base font-gaegu py-2"
          >
            {isLoading ? "Processing..." : "Yes, I am sure!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
