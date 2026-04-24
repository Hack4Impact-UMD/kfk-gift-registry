import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmUnpublishModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  action: "publish" | "unpublish";
  isPending?: boolean;
  errorMessage?: string;
};

export function ConfirmUnpublishModal({
  open,
  onOpenChange,
  onConfirm,
  action,
  isPending = false,
  errorMessage,
}: ConfirmUnpublishModalProps) {
  const isUnpublishAction = action === "unpublish";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center border-2 border-kfk-blue bg-card shadow-xl rounded-xl p-6 w-[313px]">
        <p className="my-6 text-center">
          Are you sure you want to {action} this profile?
        </p>

        {errorMessage ? (
          <p className="mb-4 text-center text-sm text-kfk-red">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex gap-8">
          <Button
            className="px-4 py-2 rounded"
            variant="default"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            className="px-4 py-2 rounded"
            variant={isUnpublishAction ? "destructive" : "default"}
            onClick={async () => {
              try {
                await onConfirm();
                onOpenChange(false);
              } catch {
                // errors handled by parent component's mutation error state and toast
              }
            }}
            disabled={isPending}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
