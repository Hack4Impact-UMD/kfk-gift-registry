import { createFileRoute } from '@tanstack/react-router'

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Form, Label } from 'radix-ui'

import { 
  FormAgreement, 
  FormButton,
 } from '../components/formcomponents'

import { FieldGroup } from "@/components/ui/field"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import "@/styles.css"

import KFKLogo from "@/assets/kisses-for-kyle-logo.png"

export const Route = createFileRoute('/family/form/consent')({
  component: ConsentForm,
})

function ConsentForm() {
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
        <FieldGroup>
          <FormAgreement name="address_form">
            By checking this box, I agree that Kisses for Kyle will share my home/mailing address listed above with donors who will be providing my child's holiday gift selections. I understand that these gifts will be shipped directly to my home by the donor
          </FormAgreement>
          <FormAgreement name="identity_form">
By checking this box, I certify that I am the legal parent or court-appointed guardian of the child(ren) listed in this application and that the child(ren) currently reside in my household. I understand that confirmation of legal guardianship and residency is required to participate in the Kisses for Kyle Holiday Gift Drive, and I acknowledge that providing false information may result in removal from the program.          </FormAgreement>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <FormButton label="Agree and Continue"/>
      </CardFooter>
    </Card>
  )
}