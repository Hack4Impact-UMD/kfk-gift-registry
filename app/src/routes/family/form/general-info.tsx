"use client"
import { createFileRoute } from "@tanstack/react-router"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { 
  EnvelopeIcon, 
  MapPinIcon,
  PhoneIcon, 
  UsersIcon, 
} from "@heroicons/react/24/solid"

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

import { 
  FormFieldInput,
  FormSelect
 } from '../components/formcomponents'

import { Form } from "@/components/ui/form"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"


const formSchema = z.object({
  // General Info
  parentName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  confirmEmail: z.string().email("Please confirm email"),
  phone: z.string().min(10, "Invalid phone number"),
  confirmPhone: z.string().min(10, "Please confirm phone"),
  
  // Address
  streetAddress: z.string().min(1, "Street address is required"),
  addressLine2: z.string().min(1, "Unit/Apt is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "Select a state"),
})
.refine((data) => data.email === data.confirmEmail, {
  message: "Emails do not match",
  path: ["confirmEmail"],
})
.refine((data) => data.phone === data.confirmPhone, {
  message: "Phone numbers do not match",
  path: ["confirmPhone"],
});


export function RouteComponent() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardDescription className="text-center">Fill all required fields to go to next step<span className="text-destructive">*</span></CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-w-xl mx-auto gap-12">
            
            {/* --- SECTION: GENERAL INFO --- */}
            <section className="space-y-6">
              <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
                <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">General Information</h2>
              </div>

              <FormFieldInput control={form.control} name="parentName" label="Your Name (Parent/Guardian)" placeholder="e.g. Jane Doe" icon={UsersIcon} required />
              <FormFieldInput control={form.control} name="email" label="Enter Email" placeholder="e.g. janedoe@gmail.com" icon={EnvelopeIcon} required />
              <FormFieldInput control={form.control} name="confirmEmail" label="Re-enter Email" placeholder="e.g. janedoe@gmail.com" icon={EnvelopeIcon} required />
              <FormFieldInput control={form.control} name="phone" label="Phone Number" placeholder="(555)-555-5555" icon={PhoneIcon} />
              <FormFieldInput control={form.control} name="confirmPhone" label="Re-enter Phone Number" placeholder="(555)-555-5555" icon={PhoneIcon} />
            </section>

            {/* --- SECTION: ADDRESS --- */}
            <section className="space-y-6">
              <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
                <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">Address</h2>
              </div>

              <FormFieldInput control={form.control} name="streetAddress" label="Street Address" placeholder="Enter street address" icon={MapPinIcon} required />
              <FormFieldInput control={form.control} name="addressLine2" label="Address Line 2" placeholder="Apt, Suite, etc." icon={MapPinIcon} required />
              <FormFieldInput control={form.control} name="city" label="City" placeholder="Enter city" icon={MapPinIcon} required />
              
              <FormSelect control={form.control} name="state" label="State" required />
            </section>

            {/* --- NAVIGATION --- */}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 h-14 rounded-xl border-2 border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] font-bold text-xl">
                <ChevronLeftIcon className="mr-2 h-6 w-6" />
                Back
              </Button>
              <Button type="submit" className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-xl">
                Next
                <ChevronRightIcon className="ml-2 h-6 w-6" />
              </Button>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export const Route = createFileRoute('/family/form/general-info')({
  component: RouteComponent,
})


