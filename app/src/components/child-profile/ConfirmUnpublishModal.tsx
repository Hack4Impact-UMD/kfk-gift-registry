import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to {action} this profile?
          </DialogTitle>
          <DialogDescription>
            {isUnpublishAction
              ? "This will remove the profile from the storefront."
              : "This will display the profile on the public storefront."}
          </DialogDescription>
        </DialogHeader>

        {errorMessage ? (
          <p className="mb-4 text-center text-sm text-kfk-red">
            {errorMessage}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            className="px-4 py-2"
            variant="default"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            className="px-4 py-2"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
