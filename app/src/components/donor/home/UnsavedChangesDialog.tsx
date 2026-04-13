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

export function UnsavedChangesDialog({
  open,
  onDiscard,
  onSave,
}: {
  open: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            Unsaved changes will be lost if you leave this page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onDiscard}
            className="border-kfk-blue text-kfk-blue hover:bg-kfk-blue/10"
          >
            Discard
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onSave}
            className="bg-kfk-blue hover:bg-kfk-blue/80 text-white"
          >
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
