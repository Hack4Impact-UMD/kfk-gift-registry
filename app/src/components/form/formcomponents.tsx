import * as React from "react"

import { Button } from "@/components/ui/button"


import "@/styles.css"

import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"

import { Checkbox } from "@/components/ui/checkbox"


export const FormConsent = ({field} : {field:any}) => {
  return (
    <>
      <Field orientation="horizontal">
        <input
          id={field.name}
          name={field.name}
          checked={field.state.value}
          type="checkbox"
          onChange={(e) => field.handleChange(e.target.checked)}
        />
        <FieldLabel htmlFor={field.name}>
          I agree to the sharing of my mailing address
        </FieldLabel>
      </Field>
      {!field.state.meta.isValid && (
        <em role="alert" className="mt-0 text-xs font-medium text-red-500">
          {field.state.meta.errors.map((error: any) => 
            typeof error === 'object' ? error.message : error
          ).join(', ')}
        </em>
      )}
    </>
  )
}

interface FormSelectProps {
  control: any
  name: string
  label: string
  required?: boolean
}
export const FormSelect = ({ control, name, label, required }: FormSelectProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="relative mt-6 w-full max-w-[240px]">
          <FormLabel className="absolute -top-2 left-4 bg-white px-2 text-sm text-slate-600 z-10">
            {label}{required && <span className="text-destructive">*</span>}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="h-14 w-full rounded-md border-1 border-slate-700 focus:ring-0 text-slate-400 font-medium">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="md">Maryland</SelectItem>
              <SelectItem value="va">Virginia</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}


interface FormFieldProps {
  control: any
  name: string
  label: string
  placeholder: string
  icon: React.ComponentType<React.ComponentProps<'svg'>>
  required?: boolean
}
export const FormFieldInput = ({ control, name, label, placeholder, icon: Icon, required }: FormFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="relative mt-6">
          <FormLabel className="absolute -top-2 left-4 bg-white px-2 text-sm text-slate-600 z-10">
            {label}
            {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Icon className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-700" aria-hidden="true" />

              <Input
                {...field}
                placeholder={placeholder}
                className="h-14 pl-12 rounded-xl border-1 border-slate-700 focus-visible:ring-0 focus-visible:border-blue-500 placeholder:text-slate-400 font-medium"
              />
            </div>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  )
}