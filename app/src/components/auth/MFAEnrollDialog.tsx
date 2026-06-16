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
import { Input } from "../ui/input";
import { PhoneInput, e164ToDisplay, formatToE164 } from "../ui/phone-input";

type MFAEnrollDialogProps = {
  open: boolean;
  onSubmit: (name: string, phone: string) => void | Promise<void>;
  onCancel: () => void;
  defaultPhone?: string;
};

export default function MFAEnrollDialog({
  open,
  onSubmit,
  onCancel,
  defaultPhone,
}: MFAEnrollDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (open) {
      // oxlint-disable-next-line react-hooks-js/set-state-in-effect
      setName("");
      setPhone(defaultPhone ? e164ToDisplay(defaultPhone) : "");
    }
  }, [open, defaultPhone]);

  const digits = phone.replace(/\D/g, "");
  const canSubmit = name.trim().length > 0 && digits.length === 10;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Set Up Two-Factor Authentication</AlertDialogTitle>
          <AlertDialogDescription>
            Staff accounts require SMS two-factor authentication. Enter a name
            for this method and confirm your phone number to receive a
            verification code.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Method name</label>
            <Input
              placeholder="e.g. My Phone"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Phone number</label>
            <PhoneInput
              placeholder="(555)-555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canSubmit}
            onClick={() => onSubmit(name.trim(), formatToE164(phone))}
          >
            Send Code
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
