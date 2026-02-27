"use client"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { FormConsent } from "@/components/form/formcomponents"

import { FormItem } from "@/components/ui/form"

import KFKLogo from "@/assets/kisses-for-kyle-logo.png"
import { Button } from "@/components/ui/button"

import "@/styles.css"

import {
  Field,
  FieldDescription,
} from "@/components/ui/field"


export const Route = createFileRoute('/family/form/consent')({
  component: ConsentRouteComponent,
})

const agreementSchema = z.object({
  sharingAddress: z.boolean().refine((val) => val === true, {
    message: "Please agree to the terms and conditions.",
  }),
  guardianship: z.boolean().refine((val) => val === true, {
    message: "Please agree to the terms and conditions.",
  }),
})

function ConsentRouteComponent() {
  const form = useForm({
    defaultValues: {
      sharingAddress: false,
      guardianship: false,
    },
    validators: {
      onChange: agreementSchema,
    },
  })

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="flex flex-col gap-5">
        <img src={KFKLogo} className='w-50 m-auto'></img>
        <CardTitle className="font-bold text-[var(--color-kfk-red)] text-2xl text-center my-5">Welcome to our Annual Holiday Gift Drive!</CardTitle>
        <CardDescription>
          To participate in the Holiday Gift Drive, you must provide a mailing address for gift delivery. Your address will be shared only with interested donors who are approved to give.
        </CardDescription>
        <CardDescription>
          If you prefer not to release your address, contact <a className="underline" href="mailto:info@kissesforkyle.org">info@kissesforkyle.org</a> for other gift options.
        </CardDescription>

      </CardHeader>
      <CardContent>
        <form className="flex flex-col max-w-xl mx-auto gap-8">
          <FormItem className="flex flex-col gap-6 border bg-green-50 border-green-500 p-5 rounded-lg">
            <FieldDescription className="text-black">
              By checking this box, I agree that Kisses for Kyle will share my home/mailing address listed above with donors who will be providing my child's holiday gift selections. I understand that these gifts will be shipped directly to my home by the donor.
            </FieldDescription>
            <Field>
              <form.Field
                name="sharingAddress"
                children={(field) => (
                  <FormConsent field={field}/>
                )}
              />
            </Field>
          </FormItem>

          <FormItem className="flex flex-col gap-6 border bg-green-50 border-green-500 p-5 rounded-lg text-slate-700">
            <FieldDescription className="text-black">
              By checking this box, I certify that I am the legal parent or court-appointed guardian of the child(ren) listed in this application and that the child(ren) currently reside in my household. I understand that confirmation of legal guardianship and residency is required to participate in the Kisses for Kyle Holiday Gift Drive, and I acknowledge that providing false information may result in removal from the program.                
            </FieldDescription>
            <Field>
              <form.Field
                name="guardianship"
                children={(field) => (
                  <FormConsent field={field}/>
                )}
              />
            </Field>
          </FormItem>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
          children={([canSubmit, isSubmitting, isPristine]) => (
            <Button 
              type="submit" 
              disabled={!canSubmit || isPristine }
              size="lg" className="w-full h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg"
            >
              {isSubmitting ? '...' : 'Agree and Continue'}
            </Button>
          )}
        />
        </form>
      </CardContent>
    </Card>
  )
}