"use client"
import { createFileRoute } from "@tanstack/react-router"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { FormAgreement } from '../components/formcomponents'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Form } from "@/components/ui/form"

import KFKLogo from "@/assets/kisses-for-kyle-logo.png"
import { Button } from "@/components/ui/button"

import "@/styles.css"

const formSchema = z.object({
  address: z.boolean(),
  identity: z.boolean()
})
.refine((data) => data.address === true, {
  message: "",
  path: ["address"]
})
.refine((data) => data.identity === true, {
  message: "",
  path: ["identity"]
});

export const Route = createFileRoute('/family/form/consent')({
  component: ConsentForm,
})

function ConsentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: false,
      identity: false
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-w-xl mx-auto gap-8">

            {/* --- SECTION: ADDRESS AGREEMENT --- */}
            <FormAgreement control={form.control} name="address">
              By checking this box, I agree that Kisses for Kyle will share my home/mailing address listed above with donors who will be providing my child's holiday gift selections. I understand that these gifts will be shipped directly to my home by the donor
            </FormAgreement>

            {/* --- SECTION: IDENTITY AGREEMENT --- */}
            <FormAgreement control={form.control} name="identity">
              By checking this box, I certify that I am the legal parent or court-appointed guardian of the child(ren) listed in this application and that the child(ren) currently reside in my household. I understand that confirmation of legal guardianship and residency is required to participate in the Kisses for Kyle Holiday Gift Drive, and I acknowledge that providing false information may result in removal from the program.
            </FormAgreement>
            
            <Button size="lg" className="w-full h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg">
              Agree and Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}