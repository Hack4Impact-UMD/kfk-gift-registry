import { useState } from "react";
import type { MultiFactorInfo, PhoneMultiFactorInfo } from "firebase/auth";
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
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type MfaMethodDialogProps = {
  open: boolean;
  hints: Array<MultiFactorInfo>;
  onSelect: (hint: MultiFactorInfo) => void;
  onCancel: () => void;
};

function formatHint(hint: MultiFactorInfo): string {
  if (hint.factorId === "phone") {
    const phone = (hint as PhoneMultiFactorInfo).phoneNumber;
    return hint.displayName
      ? `${hint.displayName} - SMS to ${phone}`
      : `SMS to ${phone}`;
  }
  return hint.factorId;
}

export default function MfaMethodDialog({
  open,
  hints,
  onSelect,
  onCancel,
}: MfaMethodDialogProps) {
  const [selectedUid, setSelectedUid] = useState(hints[0]?.uid ?? "");

  const handleSubmit = () => {
    const hint = hints.find((h) => h.uid === selectedUid);
    if (hint) onSelect(hint);
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Two-Factor Authentication</AlertDialogTitle>
          <AlertDialogDescription>
            Select a verification method to receive your code.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <RadioGroup value={selectedUid} onValueChange={setSelectedUid}>
          {hints.map((hint) => (
            <>
              <Label htmlFor={hint.uid} className="cursor-pointer">
                <div
                  key={hint.uid}
                  className={`w-full border-2 rounded p-4 flex items-center gap-3 ${hint.uid === selectedUid && "border-kfk-blue border-2 text-kfk-blue"}`}
                >
                  <RadioGroupItem value={hint.uid} id={hint.uid} />
                  <div className="flex flex-col gap-1">{formatHint(hint)}</div>
                </div>
              </Label>
            </>
          ))}
        </RadioGroup>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={!selectedUid} onClick={handleSubmit}>
            Send Code
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
