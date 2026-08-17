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
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-[520px] rounded-[18px] border border-[#D1D5DB] bg-white px-5 py-7 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
      >
        <DialogHeader className="gap-0">
          <DialogTitle className="text-center text-[22px] font-semibold leading-[1.45] text-[#1F2937] sm:text-[26px]">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="mt-3 text-center text-[14px] leading-6 text-[#4B5563]">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-14 rounded-[16px] border-2 border-[#1D4ED8] bg-white font-gaegu text-[20px] font-bold text-[#1D4ED8] hover:bg-[#EFF6FF]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-14 rounded-[16px] bg-[#173FB6] font-gaegu text-[20px] font-bold text-white hover:bg-[#173FB6]/90"
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
