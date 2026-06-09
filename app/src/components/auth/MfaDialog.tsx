import { useEffect, useState } from "react";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

type MfaDialogProps = {
  open: boolean;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
  invalid?: boolean;
};

export default function MfaDialog({
  open,
  onSubmit,
  onCancel,
  invalid = false,
}: MfaDialogProps) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    // oxlint-disable-next-line react-hooks-js/set-state-in-effect
    if (invalid) setPin("");
  }, [invalid]);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter your code</AlertDialogTitle>
          <AlertDialogDescription>
            You should have received a text message with your 6-digit 2FA code.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="w-full">
          <InputOTP maxLength={6} pattern="\d" value={pin} onChange={setPin}>
            <InputOTPGroup className="h-16 w-full flex justify-center">
              <InputOTPSlot
                className="max-w-16 max-h-16 h-full w-full text-lg"
                aria-invalid={invalid}
                index={0}
              />
              <InputOTPSlot
                className="max-w-16 max-h-16 h-full w-full text-lg"
                aria-invalid={invalid}
                index={1}
              />
              <InputOTPSlot
                className="max-w-16 max-h-16 h-full w-full text-lg"
                aria-invalid={invalid}
                index={2}
              />
              <InputOTPSlot
                className="max-w-16 max-h-16 h-full w-full text-lg"
                aria-invalid={invalid}
                index={3}
              />
              <InputOTPSlot
                className="max-w-16 max-h-16 h-full w-full text-lg"
                aria-invalid={invalid}
                index={4}
              />
              <InputOTPSlot
                className="max-w-16 max-h-16 h-full w-full text-lg"
                aria-invalid={invalid}
                index={5}
              />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {invalid && (
          <p className="text-sm text-destructive text-center">
            Incorrect code. Please try again.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pin.length != 6}
            onClick={() => onSubmit(pin)}
          >
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
