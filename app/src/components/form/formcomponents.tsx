import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CardDescription } from "../ui/card";
import { FieldLabel } from "../ui/field";
import { FormItem } from "../ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

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

interface FormSelectProps {
  field:any,
  label:string,
  placeholder:string,
  values:Array<string>
  required?: boolean
}
export const FormSelect = ({field, label, placeholder, values, required}:FormSelectProps) => {
  return (
    <FormItem className="relative mt-6 w-full max-w-[240px]">
      <FieldLabel className="absolute -top-2 left-4 bg-white px-2 text-sm text-slate-600 z-10">
          {label}
          {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Select
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
      >
        <SelectTrigger 
          className={`py-6 w-full rounded-xl border-1 ${!field.state.meta.isValid ? "border-red-500" : "border-slate-700"} focus:ring-0 text-slate-400 font-medium`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {values.map((value) => (<SelectItem value={value}>{value}</SelectItem>))}
        </SelectContent>
      </Select>
    </FormItem>
  )
}

interface FormFieldProps {
  field:any,
  Icon:React.ComponentType<React.SVGProps<SVGSVGElement>>,
  label:string,
  placeholder:string,
  required?: boolean
}
export const FormFieldInput = ({ field, Icon, label, placeholder, required }:FormFieldProps) => {
  return (
    <FormItem className="relative mt-6">
        <CardDescription className={`absolute -top-2 left-4 bg-white px-2 text-sm ${!field.state.meta.isValid ? "border-red-500" : "border-slate-600"} z-10`}>
          {label}
          {required && <span className="text-destructive">*</span>}
        </CardDescription>
        <div className="relative">
          <Icon className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-700" aria-hidden="true" />
          <Input 
            type="input"
            name={field.name}
            id={field.name}
            value={field.state.value}
            placeholder={placeholder}
            onChange={(e) => field.handleChange(e.target.value)}
            className={`h-14 pl-12 rounded-xl border-1 ${!field.state.meta.isValid ? "border-red-500" : "border-slate-700"} focus-visible:ring-0 focus-visible:border-blue-500 placeholder:text-slate-400 font-medium`}
          >
          </Input>
        </div>
    </FormItem>
  )
}
