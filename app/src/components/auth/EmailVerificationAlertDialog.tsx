import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type EmailVerificationAlertDialogProps = {
  open: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function EmailVerificationAlertDialog({
  open,
  onSubmit,
  onCancel,
}: EmailVerificationAlertDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verify your email</AlertDialogTitle>
          <AlertDialogDescription>
            A verification email has been sent to your inbox. Please verify your
            email address before continuing with 2FA enrollment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
