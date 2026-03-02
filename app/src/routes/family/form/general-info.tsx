"use client"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"

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
import { generalInfoSchema } from "@/lib/formSchemas";
import { useFormContext } from "@/components/providers/FormProvider";
import { FormItem } from "@/components/ui/form"


export const Route = createFileRoute('/family/form/general-info')({
  component: GeneralRouteComponent,
})

function GeneralRouteComponent() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();


  const form = useForm({
      defaultValues: formState.generalInfo || {
       parentName: "", 
       email: "",
       emailConfirm: "",
       phoneNumber: "",
       phoneNumberConfirm: "",

       streetAddress: "",
       addressLine2: "",
       city: "",
       state: "",
       zipCode: "",
      },
      onSubmit: async ({ value }) => {
        const result = generalInfoSchema.safeParse(value);
          if (!result.success) {
            const firstError = result.error.issues[0];
            alert(`Error: ${firstError.message}`);
            return;
          }
          updateSection("generalInfo", result.data);

          navigate({ to: "/family/form/children" });
      },
      
      
  })

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("generalInfo", currentValues);
    navigate({ to: "/family/form/consent" });
  }

  return (
  <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardDescription className="text-center">Fill all required fields to go to next step<span className="text-destructive">*</span></CardDescription>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
          }}
          className="flex flex-col gap-10"
        >
          <div>
            <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
            <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">General Information</h2>
          </div>
          <form.Field
            name="parentName"
            children={(field) => (
              <FormFieldInput field={field} Icon={UsersIcon} label="Your Name (Parent/Guardian)" placeholder="Jane Doe" required/>
            )}
          />
          <form.Field
            name="email"
            children={(field) => (
              <FormFieldInput field={field} Icon={EnvelopeIcon} label="Enter Email" placeholder="e.g. janedoe@gmail.com" required/>
            )}
          />
          <form.Field
            name="emailConfirm"
            children={(field) => (
              <FormFieldInput field={field} Icon={EnvelopeIcon} label="Re-enter Email" placeholder="e.g. janedoe@gmail.com" required/>
            )}
          />
          <form.Field name="phoneNumber" children={(field) => (
              <FormFieldInput field={field} Icon={PhoneIcon} label="Phone Number" placeholder="(555)-5555-555" required/>
            )}
          />
          <form.Field name="phoneNumberConfirm" children={(field) => (
              <FormFieldInput field={field} Icon={PhoneIcon} label="Re-enter Phone Number" placeholder="(555)-5555-555" required/>
            )}
          />
          </div>
          
          <div>
            <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
              <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">Address</h2>
            </div>
            <form.Field name="streetAddress" children={(field) => (
              <FormFieldInput field={field} Icon={MapPinIcon} label="Street Address" placeholder="10 Mountain View Way" required/>
              )}
            />
            <form.Field name="addressLine2" children={(field) => (
              <FormFieldInput field={field} Icon={MapPinIcon} label="Address Line 2" placeholder="Apt. J" required/>
              )}
            />
            <form.Field name="city" children={(field) => (
              <FormFieldInput field={field} Icon={MapPinIcon} label="City" placeholder="Baltimore" required/>
              )}
            />
            <form.Field name="state" children={(field) => (
              <FormFieldInput field={field} Icon={MapPinIcon} label="State" placeholder="MD" required/>
              )}
            />
            <form.Field name="zipCode" children={(field) => (
              <FormFieldInput field={field} Icon={MapPinIcon} label="Zipcode" placeholder="10101" required/>
              )}
            />
          </div>
          
          <FormItem className="flex gap-4 pt-4 mx-5">
            <Button type="button" onClick={handleBack} variant="outline" className="flex-1 h-14 rounded-xl border-2 border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] font-bold text-lg">
              <ChevronLeftIcon className="mr-2 h-6 w-6" />
              Back
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
              children={([canSubmit, isSubmitting]) => (
                <Button 
                  type="submit" 
                  disabled={!canSubmit}
                  size="lg" className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg"
                >
                  {isSubmitting ? '...' : 'Next'}
                  <ChevronRightIcon className="ml-2 h-6 w-6" />
                </Button>
              )}
            />
          </FormItem>
        </form>
      </CardContent>
    </Card>
  )
}
