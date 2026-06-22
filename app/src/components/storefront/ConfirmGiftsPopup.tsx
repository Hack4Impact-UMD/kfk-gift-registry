import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmGiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export function ConfirmGiftsModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = "Are you sure you can commit to buying these gifts?",
  description,
  confirmLabel = "Yes, I am sure!",
}: ConfirmGiftsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-normal">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-center text-sm text-gray-600">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full text-base font-gaegu py-2"
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
