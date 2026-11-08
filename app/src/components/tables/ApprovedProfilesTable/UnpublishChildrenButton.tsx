import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useUnpublishChildren } from "@/hooks/mutations/useUnpublishChildren";

interface UnpublishChildrenButtonProps {
  childIds: Array<string>;
  onSuccess: () => void;
  disabled?: boolean;
  className?: string;
  onPendingChange?: (pending: boolean) => void;
}

export function UnpublishChildrenButton({
  childIds,
  onSuccess,
  disabled = false,
  className,
  onPendingChange,
}: UnpublishChildrenButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const unpublishMutation = useUnpublishChildren();

  useEffect(() => {
    onPendingChange?.(unpublishMutation.isPending);
  }, [unpublishMutation.isPending, onPendingChange]);

  const handleConfirm = () => {
    setConfirmOpen(false);
    unpublishMutation.mutate(childIds, { onSuccess });
  };

  const subject =
    childIds.length === 1 ? "this profile" : `${childIds.length} profiles`;

  return (
    <>
      <Button
        className={cn("sm:ml-auto", className)}
        disabled={
          disabled || childIds.length === 0 || unpublishMutation.isPending
        }
        onClick={() => setConfirmOpen(true)}
      >
        {unpublishMutation.isPending ? "Unpublishing..." : "Unpublish"}
      </Button>
      <AlertDialog open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish {subject}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {subject} from the storefront.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-kfk-red text-white hover:bg-kfk-red/90"
            >
              Yes, unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
