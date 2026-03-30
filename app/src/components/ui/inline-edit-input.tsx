import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PencilSquare } from "@/components/icons/PencilSquare";
import { SaveIcon } from "lucide-react";

interface InlineEditInputProps {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
  editing?: boolean;
  onEditClick?: () => void;
  onSaveClick?: () => void;
}

export function InlineEditInput({
  value,
  onChange,
  type,
  readOnly,
  disabled,
  editing,
  onEditClick,
  onSaveClick,
}: InlineEditInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly ?? !editing}
        disabled={disabled}
        className="pr-10 shadow-md read-only:cursor-default read-only:focus-visible:ring-0 read-only:focus-visible:border-input disabled:opacity-100"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="group absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted rounded-md"
        onClick={editing ? onSaveClick : onEditClick}
      >
        {editing ? (
          <SaveIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        ) : (
          <PencilSquare className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        )}
      </Button>
    </div>
  );
}
