import type { UserProfile } from "common";
import { UserRole } from "common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteUserProfile } from "@/hooks/mutations/useDeleteUserProfile";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
}: DeleteUserDialogProps) {
  const { mutate: deleteUser, isPending, error } = useDeleteUserProfile();

  function handleConfirm() {
    deleteUser({ userId: user.id }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user account</DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold text-foreground">{user.name}</span>
            &apos;s account. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {user.role === UserRole.DONOR && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Check for active claims first</p>
            <p className="mt-1">
              Before deleting this donor, verify that they do not have any
              active gift claims. Deleting a donor with active claims may leave
              those gifts unfulfilled.
            </p>
          </div>
        )}
        {error && (
          <p className="text-sm text-red-500">
            Failed to delete user: {error.message}
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
