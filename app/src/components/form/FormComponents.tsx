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
import { useFieldContext } from "@/hooks/family-form/fieldContext";
import { PhoneInput } from "../ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FormInputProps = {
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
  className?: string;
};

export function FormInput({
  label,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  required = false,
  className = "",
}: FormInputProps) {
  const field = useFieldContext<string>();
  const errorMessage = field.state.meta.isTouched && field.state.meta.errors[0];

  return (
    <div className={cn("space-y-2", className)}>
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
  children: ReactNode;
  id?: string;
  value?: boolean;
  disabled?: boolean;
  className?: string;
};

export function FormCheckbox({
  children,
  id,
  value,
  disabled,
  className = "",
}: FormCheckboxProps) {
  const field = useFieldContext<boolean | undefined>();
  const checkboxId = id || field.name;

  return (
    <div className={cn("flex items-start gap-3 text-left", className)}>
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

type FormBorderedCheckboxProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

export function FormBorderedCheckbox({
  children,
  id,
  className = "",
}: FormBorderedCheckboxProps) {
  const field = useFieldContext<boolean>();
  const checkboxId = id || field.name;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border rounded-lg text-left",
        className,
      )}
    >
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

type SelectOption = string | { value: string; label: string };

interface FormSelectProps {
  label: string;
  placeholder: string;
  values: Array<SelectOption>;
  onValueChange?: (value: string) => void;
  required?: boolean;
  value?: string;
  disabled?: boolean;
  className?: string;
}

export const FormSelect = ({
  label,
  placeholder,
  values,
  onValueChange,
  required,
  value,
  disabled,
  className = "",
}: FormSelectProps) => {
  const field = useFieldContext<string>();
  const errorMessage = field.state.meta.isTouched && field.state.meta.errors[0];

  return (
    <FormItem className={cn("relative mt-6 w-full max-w-60", className)}>
      <FieldLabel
        className={`absolute -top-2 left-4 bg-white px-2 text-sm ${
          errorMessage ? "text-red-500" : "text-slate-600"
        } z-10`}
      >
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <Select
        value={field.state.value || value || undefined}
        disabled={disabled}
        onValueChange={(val) => {
          field.handleChange(val);
          if (onValueChange) onValueChange(val);
        }}
      >
        <SelectTrigger
          className={`truncate py-6 w-full rounded-xl border ${
            errorMessage
              ? "border-red-500 [&>span]:text-red-500"
              : "border-slate-700"
          } focus:ring-0 data-placeholder:text-slate-400 font-medium`}
        >
          <SelectValue placeholder={placeholder} className="truncate" />
        </SelectTrigger>
        <SelectContent>
          {values.map((item) => {
            const val = typeof item === "string" ? item : item.value;
            const optionLabel = typeof item === "string" ? item : item.label;
            return (
              <SelectItem key={val} value={val}>
                {optionLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {errorMessage && (
        <span className="text-xs text-red-500 mt-1 block">{errorMessage}</span>
      )}
    </FormItem>
  );
};

interface FormFieldInputProps {
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
  maxCharactersErrorMessage?: string;
  showMaxCharactersError?: boolean;
  maxCharacters?: number;
  disabled?: boolean;
  className?: string;
}

export const FormFieldInput = ({
  Icon,
  label,
  placeholder,
  required = false,
  type = "text",
  inputMode,
  autoComplete,
  value,
  maxCharactersErrorMessage,
  showMaxCharactersError: showMaxCharactersErrorImmediately = false,
  maxCharacters,
  disabled,
  className = "",
}: FormFieldInputProps) => {
  const field = useFieldContext<string>();
  const characterCount = field.state.value?.length ?? 0;
  const immediateMaxCharacterError =
    showMaxCharactersErrorImmediately &&
    maxCharacters !== undefined &&
    characterCount > maxCharacters
      ? (maxCharactersErrorMessage ??
        `Please keep this field to ${maxCharacters} characters or less`)
      : undefined;
  const errorMessage =
    (field.state.meta.isTouched && field.state.meta.errors[0]) ||
    immediateMaxCharacterError;

  return (
    <FormItem className={cn("group relative mt-6", className)}>
      <CardDescription
        className={`absolute -top-2 left-4 bg-white px-2 text-sm ${
          errorMessage
            ? "text-red-500"
            : "text-slate-600 group-focus-within:text-kfk-blue"
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
        {type === "tel" ? (
          <PhoneInput
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
            } rounded-xl border ${
              errorMessage
                ? "border-red-500 text-red-500 placeholder:text-red-500"
                : "border-slate-700 placeholder:text-slate-400"
            } focus-visible:ring-0 focus-visible:border-kfk-blue font-medium transition duration-200 ease-in-out`}
          />
        ) : (
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
            } rounded-xl border ${
              errorMessage
                ? "border-red-500 text-red-500 placeholder:text-red-500"
                : "border-slate-700 placeholder:text-slate-400"
            } focus-visible:ring-0 focus-visible:border-kfk-blue font-medium transition duration-200 ease-in-out`}
          />
        )}
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

type FormTextareaProps = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  maxWords?: number;
  maxCharacters?: number;
  maxCharactersErrorMessage?: string;
  showMaxCharactersErrorImmediately?: boolean;
  disabled?: boolean;
  className?: string;
};

export function FormTextarea({
  label,
  placeholder,
  required = false,
  maxWords,
  maxCharacters,
  maxCharactersErrorMessage,
  showMaxCharactersErrorImmediately = false,
  disabled,
  className = "",
}: FormTextareaProps) {
  const field = useFieldContext<string>();
  const wordCount = field.state.value
    ? field.state.value.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const characterCount = field.state.value?.length ?? 0;
  const immediateMaxCharacterError =
    showMaxCharactersErrorImmediately &&
    maxCharacters !== undefined &&
    characterCount > maxCharacters
      ? (maxCharactersErrorMessage ??
        `Please keep this field to ${maxCharacters} characters or less`)
      : undefined;
  const errorMessage =
    (field.state.meta.isTouched && field.state.meta.errors[0]) ||
    immediateMaxCharacterError;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium text-kfk-blue">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </p>
      )}
      <Textarea
        placeholder={placeholder}
        value={field.state.value || ""}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        disabled={disabled}
        className={`resize-none min-h-[100px] ${errorMessage ? "border-red-500" : ""}`}
      />
      {maxCharacters !== undefined && !disabled && (
        <p className="text-xs text-right text-slate-500">
          {characterCount} out of {maxCharacters}
        </p>
      )}
      {maxWords !== undefined && maxCharacters === undefined && !disabled && (
        <p className="text-xs text-right text-slate-500">
          {wordCount} out of {maxWords}
        </p>
      )}
      {errorMessage && (
        <span className="text-sm text-red-500">{errorMessage}</span>
      )}
    </div>
  );
}

type FormAgreementProps = {
  children: ReactNode;
  checkboxLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export function FormAgreement({
  children,
  checkboxLabel = "I agree to the sharing of my mailing address",
  id,
  disabled,
  className = "",
}: FormAgreementProps) {
  const field = useFieldContext<boolean>();
  const checkboxId = id || field.name;

  return (
    <div
      className={cn(
        "border bg-green-50 border-green-500 p-5 rounded-lg",
        className,
      )}
    >
      <div className="text-black text-sm mb-3">{children}</div>
      <div className="flex items-start gap-3">
        <Checkbox
          id={checkboxId}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(!!checked)}
          disabled={disabled}
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
      className="w-full h-14 bg-kfk-blue mt-5 hover:bg-kfk-blue/90 text-white font-semibold"
    >
      {isSubmitting ? "Submitting..." : label}
    </Button>
  );
}
