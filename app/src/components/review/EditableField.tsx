import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableFieldProps
  extends React.ComponentProps<typeof Input> {
  editable?: boolean;
}

export function EditableField({
  value,
  onChange,
  editable = false,
  className,
  ...props
}: EditableFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editable) inputRef.current?.focus();
  }, [editable]);

  if (!editable) {
    return (
      <p
        className={cn(
          "h-9 py-1 pr-10 flex items-center",
          className
        )}
      >
        {value}
      </p>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={onChange}
      className={cn(
          "border-foreground",
          className
        )}
      {...props}
    />
  );
}