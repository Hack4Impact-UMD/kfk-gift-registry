import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableFieldProps extends React.ComponentProps<typeof Input> {
  editable?: boolean;
  children?: React.ReactNode;
  fieldSize?: number;
}

export function EditableField({
  value,
  onChange,
  editable = false,
  className,
  fieldSize,
  children,
  ...props
}: EditableFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editable) inputRef.current?.focus();
  }, [editable]);

  if (!editable) {
    return (
      <p className={cn(`py-1 ${!children && "flex h-9"} items-center break-all`, className)}>
        <b>{children}</b> {value}
      </p>
    );
  }

  return (
    <>
      { children && (<b className="whitespace-nowrap my-auto mr-2">{children}</b>)}
      <Input
        ref={inputRef}
        value={value}
        onChange={onChange}
        className={cn(`border-foreground w-${fieldSize}`, className)}
        {...props}
      />
    </>
  );
}
