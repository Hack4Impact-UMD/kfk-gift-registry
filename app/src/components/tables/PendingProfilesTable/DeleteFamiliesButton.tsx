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
import { useDeleteFamilies } from "@/hooks/mutations/useDeleteFamilies";

interface DeleteFamiliesButtonProps {
  familyIds: Array<string>;
  onSuccess: () => void;
  disabled?: boolean;
  className?: string;
  onPendingChange?: (pending: boolean) => void;
}

export function DeleteFamiliesButton({
  familyIds,
  onSuccess,
  disabled = false,
  className,
  onPendingChange,
}: DeleteFamiliesButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteFamiliesMutation = useDeleteFamilies();

  useEffect(() => {
    onPendingChange?.(deleteFamiliesMutation.isPending);
  }, [deleteFamiliesMutation.isPending, onPendingChange]);

  const handleConfirm = () => {
    setConfirmOpen(false);
    deleteFamiliesMutation.mutate(familyIds, { onSuccess });
  };

  return (
    <>
      <Button
        className={cn(
          "min-w-36 bg-kfk-red text-white hover:bg-kfk-red/90",
          className,
        )}
        disabled={
          disabled || familyIds.length === 0 || deleteFamiliesMutation.isPending
        }
        onClick={() => setConfirmOpen(true)}
      >
        {deleteFamiliesMutation.isPending ? "Deleting..." : "Delete"}
      </Button>
      <AlertDialog open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {familyIds.length === 1
                ? "this family"
                : `${familyIds.length} families`}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              {familyIds.length === 1 ? "this family" : "these families"} and
              all of their children, gifts, and links. This cannot be undone.
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
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
