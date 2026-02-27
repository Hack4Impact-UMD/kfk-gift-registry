import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type FormInputProps = {
  field: any; //Should try to fix this later.
  label: string;
  type?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal" | "search" | "url";
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
};

export function FormInput({
  field,
  label,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  required = false,
}: FormInputProps) {
  const errorMessage = field.state.meta.errors?.[0];
  
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {label}
        {required && " *"}
      </Label>
      <Input
        id={field.name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={`text-base h-11 ${errorMessage ? "border-red-500" : ""}`}
        required={required}
      />
      {errorMessage && (
        <span className="text-sm text-red-500">{errorMessage}</span>
      )}
    </div>
  );
}

type FormCheckboxProps = {
  field: any; // Should try to fix this later.
  children: ReactNode;
  id?: string;
};

export function FormCheckbox({
  field,
  children,
  id,
}: FormCheckboxProps) {
  const checkboxId = id || field.name;
  
  return (
    <div className="flex items-start gap-3 text-left">
      <Checkbox
        id={checkboxId}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(!!checked)}
        className="mt-0.5"
      />
      <label htmlFor={checkboxId} className="text-sm cursor-pointer">
        {children}
      </label>
    </div>
  );
}

export function FormBorderedCheckbox({
  field,
  children,
  id,
}: FormCheckboxProps) {
  const checkboxId = id || field.name;
  
  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg text-left">
      <Checkbox
        id={checkboxId}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(!!checked)}
        className="mt-0.5"
      />
      <label htmlFor={checkboxId} className="text-sm leading-relaxed cursor-pointer">
        {children}
      </label>
    </div>
  );
}