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
  const normalizedValue = value && value !== "" ? String(value) : undefined;

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
        key={normalizedValue ?? "empty"}
        value={normalizedValue}
        onValueChange={selectOnChange}
      >
        <SelectTrigger className="h-9 px-3 text-sm bg-kfk-blue text-white border border-black rounded-md hover:bg-kfk-blue/90 [&_svg]:text-white [&_svg]:stroke-white [&_svg]:opacity-100 [&_svg]:[stroke-width:2.5]">
          <span>Gift Status</span>
        </SelectTrigger>

        <SelectContent
          position="popper"
          align="start"
          className="w-[var(--radix-select-trigger-width)] mt-[-7px] p-0 bg-transparent border-none shadow-none"
        >
          <SelectGroup className="w-full">
            {selectOptions?.map((val) => (
              <SelectItem
                key={val}
                value={val}
                className="w-full px-4 py-2 text-sm bg-white border border-black cursor-pointer data-[highlighted]:bg-gray-200 -mt-px"
              >
                {val}
              </SelectItem>
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
    <div className={cn("flex items-center gap-2 w-full", className)}>
      {children && <b className="whitespace-nowrap">{children}</b>}
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={value}
        onChange={inputOnChange}
        className="flex-1 min-w-0 border-foreground"
        {...props}
      />
    </div>
  );
}
