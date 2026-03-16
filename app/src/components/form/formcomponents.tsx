import { CardDescription } from "../ui/card";
import { FieldLabel } from "../ui/field";
import { FormItem } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type FormInputProps = {
  field: any;
  label: string;
  type?: string;
  inputMode?:
    | "text"
    | "email"
    | "tel"
    | "numeric"
    | "decimal"
    | "search"
    | "url";
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
  const errorMessage =
    field.state.meta.isTouched && field.state.meta.errors?.[0];

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
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
        className={`truncate text-base h-11 ${errorMessage ? "border-red-500" : ""}`}
      />
      {errorMessage && (
        <span className="text-sm text-red-500">{errorMessage}</span>
      )}
    </div>
  );
}

type FormCheckboxProps = {
  field: any;
  children: ReactNode;
  id?: string;
  value?: boolean;
  disabled?: boolean;
};

export function FormCheckbox({
  field,
  children,
  id,
  value,
  disabled,
}: FormCheckboxProps) {
  const checkboxId = id || field.name;

  return (
    <div className="flex items-start gap-3 text-left">
      <Checkbox
        id={checkboxId}
        checked={field.state.value ?? value}
        onCheckedChange={(checked) => field.handleChange(!!checked)}
        disabled={disabled}
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
      <label
        htmlFor={checkboxId}
        className="text-sm leading-relaxed cursor-pointer"
      >
        {children}
      </label>
    </div>
  );
}

interface FormSelectProps {
  field: any;
  label: string;
  placeholder: string;
  values: Array<string>;
  onValueChange?: (value: string) => void;
  required?: boolean;
  value?: string;
  disabled?: boolean;
}

export const FormSelect = ({
  field,
  label,
  placeholder,
  values,
  onValueChange,
  required,
  value,
  disabled,
}: FormSelectProps) => {
  const errorMessage =
    field.state.meta.isTouched && field.state.meta.errors?.[0];

  return (
    <FormItem className="relative mt-6 w-full max-w-[240px]">
      <FieldLabel
        className={`absolute -top-2 left-4 bg-white px-2 text-sm ${
          errorMessage ? "text-red-500" : "text-slate-600"
        }

         z-10`}
      >
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <Select
        value={
          field.state.value !== undefined &&
          field.state.value !== null &&
          field.state.value !== "" &&
          field.state.value !== 0
            ? String(field.state.value)
            : value || undefined
        }
        disabled={disabled}
        onValueChange={(value) => {
          field.handleChange(value);
          if (onValueChange) onValueChange(value);
        }}
      >
        <SelectTrigger
          className={`truncate py-6 w-full rounded-xl border-1 ${
            errorMessage
              ? "border-red-500 [&>span]:text-red-500"
              : "border-slate-700"
          } focus:ring-0 data-[placeholder]:text-slate-400 font-medium`}
        >
          <SelectValue placeholder={placeholder} className="truncate" />
        </SelectTrigger>
        <SelectContent>
          {values.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errorMessage && (
        <span className="text-xs text-red-500 mt-1 block">{errorMessage}</span>
      )}
    </FormItem>
  );
};

interface FormFieldProps {
  field: any;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  inputMode?:
    | "text"
    | "email"
    | "tel"
    | "numeric"
    | "decimal"
    | "search"
    | "url";
  autoComplete?: string;
  value?: string;
  disabled?: boolean;
}

export const FormFieldInput = ({
  field,
  Icon,
  label,
  placeholder,
  required = false,
  type = "text",
  inputMode,
  autoComplete,
  value,
  disabled,
}: FormFieldProps) => {
  const errorMessage =
    field.state.meta.isTouched && field.state.meta.errors?.[0];

  return (
    <FormItem className="group relative mt-6">
      <CardDescription
        className={`absolute -top-2 left-4 bg-white px-2 text-sm ${
          errorMessage
            ? "text-red-500"
            : "text-slate-600 group-focus-within:text-[var(--color-kfk-blue)]"
        } z-10`}
      >
        {label}
        {required && <span className="text-destructive"> *</span>}
      </CardDescription>
      <div className="relative">
        <Icon
          className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-700"
          aria-hidden="true"
        />
        <Input
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          name={field.name}
          id={field.name}
          value={field.state.value || value || ""}
          placeholder={placeholder}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
          className={`truncate h-14 pl-12 ${
            errorMessage ? "pr-12" : "pr-4"
          } rounded-xl border-1 ${
            errorMessage
              ? "border-red-500 text-red-500 placeholder:text-red-500"
              : "border-slate-700 placeholder:text-slate-400"
          } focus-visible:ring-0 focus-visible:border-[var(--color-kfk-blue)] font-medium transition duration-200 ease-in-out`}
        />
        {errorMessage && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
              !
            </span>
          </div>
        )}
      </div>
      {errorMessage && (
        <span className="text-xs text-red-500 mt-1 block pl-1">
          {errorMessage}
        </span>
      )}
    </FormItem>
  );
};

type FormAgreementProps = {
  field: any;
  children: ReactNode;
  checkboxLabel?: string;
  id?: string;
};

export function FormAgreement({
  field,
  children,
  checkboxLabel = "I agree to the sharing of my mailing address",
  id,
}: FormAgreementProps) {
  const checkboxId = id || field.name;

  return (
    <div className="border bg-green-50 border-green-500 p-5 rounded-lg">
      <div className="text-black text-sm mb-3">{children}</div>
      <div className="flex items-start gap-3">
        <Checkbox
          id={checkboxId}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(!!checked)}
          className="mt-0.5"
        />
        <label htmlFor={checkboxId} className="text-sm cursor-pointer">
          {checkboxLabel}
        </label>
      </div>
    </div>
  );
}

type FormButtonProps = {
  label: string;
  disabled?: boolean;
  isSubmitting?: boolean;
};

export function FormButton({
  label,
  disabled = false,
  isSubmitting = false,
}: FormButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={disabled || isSubmitting}
      className="w-full h-14 bg-[var(--color-kfk-blue)] mt-5 hover:bg-[var(--color-kfk-blue)]/90 text-white font-semibold"
    >
      {isSubmitting ? "Submitting..." : label}
    </Button>
  );
}
