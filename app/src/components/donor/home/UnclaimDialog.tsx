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

export function UnclaimDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to un-claim the gift?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible and will return the gift back to the
            storefront.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onCancel}
            className="bg-kfk-blue hover:bg-kfk-blue/80 text-white"
          >
            Cancel
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onConfirm}
            className="border-kfk-blue text-kfk-blue hover:bg-kfk-blue/10"
          >
            Yes, I am sure
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
