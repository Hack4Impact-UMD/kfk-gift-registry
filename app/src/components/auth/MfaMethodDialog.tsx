import { useState } from "react";
import { MultiFactorInfo, PhoneMultiFactorInfo } from "firebase/auth";
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
  hints: MultiFactorInfo[];
  onSelect: (hint: MultiFactorInfo) => void;
  onCancel: () => void;
};

function formatHint(hint: MultiFactorInfo): string {
  if (hint.displayName) return hint.displayName;
  if (hint.factorId === "phone") {
    const phone = (hint as PhoneMultiFactorInfo).phoneNumber;
    return `SMS to ${phone}`;
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

        <RadioGroup
          value={selectedUid}
          onValueChange={setSelectedUid}
          className="py-2"
        >
          {hints.map((hint) => (
            <div key={hint.uid} className="flex items-center gap-3">
              <RadioGroupItem value={hint.uid} id={hint.uid} />
              <Label htmlFor={hint.uid} className="cursor-pointer">
                {formatHint(hint)}
              </Label>
            </div>
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
