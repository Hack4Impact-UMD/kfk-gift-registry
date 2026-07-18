import type { GiftDrive } from "common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { driveLabel } from "./formLinkUtils";

interface DrivePickerProps {
  value: string;
  onValueChange: (driveId: string) => void;
  drives: Array<GiftDrive>;
  id?: string;
  disabled?: boolean;
  className?: string;
}

/** Select for choosing which gift drive a form link belongs to. */
export function DrivePicker({
  value,
  onValueChange,
  drives,
  id,
  disabled,
  className,
}: DrivePickerProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className={className ?? "w-full border"}>
        <SelectValue placeholder="Select a drive" />
      </SelectTrigger>
      <SelectContent>
        {drives.map((drive) => (
          <SelectItem key={drive.id} value={drive.id}>
            {driveLabel(drive)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
