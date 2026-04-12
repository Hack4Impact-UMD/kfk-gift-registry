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
  fieldType?: "input" | "textarea" | "select";
  selectOptions?: Array<string>;
  onChange?: EditableFieldChangeHandler;
}

export function EditableField({
  value,
  onChange,
  editable = false,
  className,
  fieldType,
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
      <p
        className={cn(
          `py-1 ${!children && "flex h-9"} items-center break-all`,
          className,
        )}
      >
        <b>{children}</b> {value}
      </p>
    );
  }

  if (fieldType === "select") {
    return (
      <Select
        defaultValue={value?.toString()}
        value={value?.toString()}
        onValueChange={selectOnChange}
      >
        <SelectTrigger className="w-full max-w-48 border-1 border-black">
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
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

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
        <p
          className={`self-end ${wordCount <= 25 ? "text-muted-foreground" : "text-destructive"}`}
        >
          {wordCount}/25 words
        </p>
      </>
    );
  }

  return (
    <>
      {children && <b className="whitespace-nowrap my-auto mr-2">{children}</b>}
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={value}
        onChange={inputOnChange}
        className={cn("border-foreground", className)}
        {...props}
      />
    </>
  );
}
