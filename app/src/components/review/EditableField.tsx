import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { PhoneInput } from "../ui/phone-input";

type EditableFieldChangeHandler =
  | React.ChangeEventHandler<HTMLInputElement>
  | React.ChangeEventHandler<HTMLTextAreaElement>
  | ((value: string) => void);

interface EditableFieldProps extends Omit<
  React.ComponentProps<typeof Input>,
  "onChange"
> {
  editable?: boolean;
  children?: React.ReactNode;
  fieldType?: "input" | "textarea" | "select" | "phone";
  characterLimit?: number;
  selectOptions?: Array<string>;
  onChange?: EditableFieldChangeHandler;
}

export function EditableField({
  value,
  onChange,
  editable = false,
  className,
  fieldType,
  characterLimit,
  selectOptions,
  children,
  ...props
}: EditableFieldProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const inputOnChange = onChange as
    | React.ChangeEventHandler<HTMLInputElement>
    | undefined;
  const textareaOnChange = onChange as
    | React.ChangeEventHandler<HTMLTextAreaElement>
    | undefined;
  const selectOnChange = onChange as ((value: string) => void) | undefined;

  useEffect(() => {
    if (editable) inputRef.current?.focus();
  }, [editable]);

  if (!editable) {
    return (
      <div className={cn("flex items-center gap-2 min-w-0 py-1")}>
        {children && <b className="whitespace-nowrap shrink-0">{children}</b>}
        <span className="min-w-0 break-words">{value}</span>
      </div>
    );
  }

  if (fieldType === "select") {
    return (
      <Select
        defaultValue={value?.toString()}
        value={value?.toString()}
        onValueChange={selectOnChange}
      >
        <SelectTrigger className="w-full min-w-0 border border-black">
          <SelectValue placeholder="Select a level" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {selectOptions &&
              selectOptions.map((val) => (
                <SelectItem value={val}>{val}</SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  if (fieldType === "textarea") {
    const text = typeof value === "string" ? value : (value?.toString() ?? "");
    const charCount = text.length;

    return (
      <>
        {children && <b className="whitespace-nowrap mr-2">{children}</b>}
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={textareaOnChange}
          className={cn("border-foreground", className)}
          {...(props as React.ComponentProps<typeof Textarea>)}
        />
        {characterLimit !== undefined && (
          <p
            className={`self-end ${
              charCount <= characterLimit
                ? "text-muted-foreground"
                : "text-destructive"
            }`}
          >
            {charCount}/{characterLimit} characters
          </p>
        )}
      </>
    );
  }

  if (fieldType === "phone") {
    return (
      <>
        {children && (
          <b className="whitespace-nowrap my-auto mr-2">{children}</b>
        )}
        <PhoneInput
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={value}
          onChange={inputOnChange}
          className={cn("border-foreground", className)}
          {...props}
        />
      </>
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <div className="flex w-full items-center gap-2">
        {children && <b className="whitespace-nowrap">{children}</b>}
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={value}
          onChange={inputOnChange}
          className="w-full min-w-0 border-foreground"
          {...props}
        />
      </div>
      {characterLimit !== undefined && (
        <p
          className={`self-end text-xs ${
            String(value ?? "").length <= characterLimit
              ? "text-muted-foreground"
              : "text-destructive"
          }`}
        >
          {String(value ?? "").length}/{characterLimit} characters
        </p>
      )}
    </div>
  );
}
