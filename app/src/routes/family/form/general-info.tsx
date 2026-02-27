"use client"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"

import { 
  EnvelopeIcon, 
  EnvelopeOpenIcon, 
  MapPinIcon,
  PhoneIcon, 
  UsersIcon, 
} from "@heroicons/react/24/solid"

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

import { FormFieldInput, FormSelect } from "@/components/form/formcomponents"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

export const Route = createFileRoute('/family/form/general-info')({
  component: GeneralRouteComponent,
})


const schema = z.object({
  guardianName: z.string().min(2, "Name is required."),
  email: z.string().min(1, "Email field is required.").email("Email is invalid"),
  confirmEmail: z.string().email(),
  phone: z.string().regex(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/, 'invalid'),
  confirmPhone: z.string().regex(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/, 'invalid'),

  streetAddress: z.string().min(1, "Street address is required"),
  addressLine2: z.string().min(1, "Unit/Apt is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "Select a state"),
})
.refine((data) => data.email === data.confirmEmail, {
  message: "Emails do not match.",
  path: ["confirmEmail"],
})
.refine((data) => data.phone === data.confirmPhone, {
  message: "Phone Numbers do not match.",
  path: ["confirmPhone"],
})

function GeneralRouteComponent() {
  const states: Array<string> = ["CA", "MD", "VA"]

  const form = useForm({
      defaultValues: {
       guardianName: "", 
       email: "",
       confirmEmail: "",
       phone: "",
       confirmPhone: "",

       streetAddress: "",
       addressLine2: "",
       city: "",
       state: "",
      },
      validators: {
        onChange: schema,
      },
      
  })

  return (
  <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardDescription className="text-center">Fill all required fields to go to next step<span className="text-destructive">*</span></CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-10">
          <div>
            <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
            <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">General Information</h2>
          </div>
          <form.Field
            name="guardianName"
            children={(field) => (
              <FormFieldInput
                field={field}
                Icon={UsersIcon}
                label="Your Name (Parent/Guardian)"
                placeholder="Jane Doe"
                required
              />
            )}
          />

          <form.Field
            name="email"
            children={(field) => (
              <FormFieldInput
                field={field}
                Icon={EnvelopeIcon}
                label="Enter Email"
                placeholder="e.g. janedoe@gmail.com"
                required
              />
            )}
          />
          
          <form.Field
              name="confirmEmail"
              children={(field) => (
              <FormFieldInput
                field={field}
                Icon={EnvelopeIcon}
                label="Re-enter Email"
                placeholder="e.g. janedoe@gmail.com"
                required
              />
            )}
          />

            <form.Field
              name="phone"
              children={(field) => (
                <FormFieldInput
                  field={field}
                  Icon={PhoneIcon}
                  label="Phone Number"
                  placeholder="(555)-5555-555"
                  required
                />
              )}
            />

            <form.Field
              name="confirmPhone"
              children={(field) => (
                <FormFieldInput
                  field={field}
                  Icon={PhoneIcon}
                  label="Re-enter Phone Number"
                  placeholder="(555)-5555-555"
                  required
                />
              )}
            />
          </div>
          
          <div>
            <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
              <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">Address</h2>
            </div>

            <form.Field
              name="streetAddress"
              children={(field) => (
                <FormFieldInput
                  field={field}
                  Icon={MapPinIcon}
                  label="Street Address"
                  placeholder="10 Mountain View Way"
                  required
                />
              )}
            />
            <form.Field
              name="addressLine2"
              children={(field) => (
                <FormFieldInput
                  field={field}
                  Icon={MapPinIcon}
                  label="Address Line 2"
                  placeholder="Apt. J"
                  required
                />
              )}
            />
            <form.Field
              name="city"
              children={(field) => (
                <FormFieldInput
                  field={field}
                  Icon={MapPinIcon}
                  label="City"
                  placeholder="Baltimore"
                  required
                />
              )}
            />

            <form.Field
              name="state"
              children={(field) => (
                <FormSelect
                  field={field}
                  label="State"
                  placeholder="Select a State"
                  values={states}
                  required
                />
              )}
            />
          </div>
          
          <div className="flex gap-4 pt-4 mx-5">
            <Button variant="outline" className="flex-1 h-14 rounded-xl border-2 border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] font-bold text-lg">
              <ChevronLeftIcon className="mr-2 h-6 w-6" />
              Back
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
              children={([canSubmit, isSubmitting, isPristine]) => (
                <Button 
                  type="submit" 
                  disabled={!canSubmit || isPristine }
                  size="lg" className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg"
                >
                  {isSubmitting ? '...' : 'Next'}
                  <ChevronRightIcon className="ml-2 h-6 w-6" />
                </Button>
              )}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
