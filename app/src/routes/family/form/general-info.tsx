import { createFileRoute, useNavigate } from "@tanstack/react-router"


import { 
  EnvelopeIcon, 
  MapPinIcon,
  PhoneIcon, 
  UsersIcon, 
} from "@heroicons/react/24/solid"

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

import { FormFieldInput, FormSelect } from "@/components/form/formcomponents"
import { US_STATES } from "@/lib/formSchemas"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { useFormContext } from "@/components/providers/FormProvider"
import { FormItem } from "@/components/ui/form"
import { FormProgressBar } from "@/components/form/FormProgressBar"
import { useGeneralInfoForm, useProgressBarNavigation } from "@/hooks/form/FormHooks"


export const Route = createFileRoute('/family/form/general-info')({
  component: GeneralRouteComponent,
})

function GeneralRouteComponent() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();

  const form = useGeneralInfoForm();

  const handleProgressBarNavigate = useProgressBarNavigation(
    "generalInfo",
    () => form.state.values
  );

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("generalInfo", currentValues);
    navigate({ to: "/family/form/consent" });
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardDescription className="text-center">
          Fill all required fields to go to next step<span className="text-destructive">*</span>
        </CardDescription>
        <FormProgressBar onNavigate={handleProgressBarNavigate} />
      </CardHeader>
      <CardContent>
        <form
          noValidate
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
              validators={{
                onChange: ({ value }) => 
                  !value ? 'Parent/Guardian name is required' : 
                  value.length > 100 ? 'Name is too long' : undefined
              }}
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
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Email is required';
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                  return undefined;
                }
              }}
              children={(field) => (
                <FormFieldInput 
                  field={field} 
                  Icon={EnvelopeIcon} 
                  label="Enter Email" 
                  placeholder="e.g. janedoe@gmail.com"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                />
              )}
            />
            
            <form.Field
              name="emailConfirm"
              validators={{
                onChangeListenTo: ['email'],
                onChange: ({ value, fieldApi }) => {
                  if (!value) return 'Please confirm your email';
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                  const email = fieldApi.form.getFieldValue('email');
                  if (value !== email) return 'Emails do not match';
                  return undefined;
                }
              }}
              children={(field) => (
                <FormFieldInput 
                  field={field} 
                  Icon={EnvelopeIcon} 
                  label="Re-enter Email" 
                  placeholder="e.g. janedoe@gmail.com"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                />
              )}
            />
            
            <form.Field 
              name="phoneNumber"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value === '') return undefined;
                  if (!/^[\d\s\-\(\)]+$/.test(value)) return 'Please enter a valid phone number';
                  return undefined;
                }
              }}
              children={(field) => (
                <FormFieldInput 
                  field={field} 
                  Icon={PhoneIcon} 
                  label="Phone Number" 
                  placeholder="(555)-555-5555"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                />
              )}
            />
            
            <form.Field 
              name="phoneNumberConfirm"
              validators={{
                onChangeListenTo: ['phoneNumber'],
                onChange: ({ value, fieldApi }) => {
                  if (!value || value === '') return undefined;
                  if (!/^[\d\s\-\(\)]+$/.test(value)) return 'Please enter a valid phone number';
                  const phoneNumber = fieldApi.form.getFieldValue('phoneNumber');
                  if (value !== phoneNumber) return 'Phone numbers do not match';
                  return undefined;
                }
              }}
              children={(field) => (
                <FormFieldInput 
                  field={field} 
                  Icon={PhoneIcon} 
                  label="Re-enter Phone Number" 
                  placeholder="(555)-555-5555"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
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
              validators={{
                onChange: ({ value }) => 
                  !value ? 'Street address is required' : 
                  value.length > 200 ? 'Address is too long' : undefined
              }}
              children={(field) => (
                <FormFieldInput 
                  field={field} 
                  Icon={MapPinIcon} 
                  label="Street Address" 
                  placeholder="10 Mountain View Way"
                  autoComplete="street-address"
                  required
                />
              )}
            />
            
            <form.Field 
              name="addressLine2"
              validators={{
                onChange: ({ value }) => 
                  value && value.length > 200 ? 'Address is too long' : undefined
              }}
              children={(field) => (
                <FormFieldInput 
                  field={field} 
                  Icon={MapPinIcon} 
                  label="Address Line 2" 
                  placeholder="Apt. J"
                  autoComplete="address-line2"
                />
              )}
            />
            
            <form.Field 
              name="city"
              validators={{
                onChange: ({ value }) => 
                  !value ? 'City is required' : 
                  value.length > 100 ? 'City name is too long' : undefined
              }}
              children={(field) => (
                <FormFieldInput 
                  field={field} 
                  Icon={MapPinIcon} 
                  label="City" 
                  placeholder="Baltimore"
                  autoComplete="address-level2"
                  required
                />
              )}
            />
            
            <form.Field
              name="state"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "State is required";
                  return undefined;
                }
              }}
              children={(field) => (
                <FormSelect
                  field={field}
                  label="State"
                  placeholder="Select State"
                  values={US_STATES}
                  required
                />
              )}
            />
            
            <form.Field 
              name="zipCode"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Zip code is required';
                  if (!/^\d{5}(-\d{4})?$/.test(value)) return 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
                  return undefined;
                }
              }}
              children={(field) => (
                <FormFieldInput 
                  field={field} 
                  Icon={MapPinIcon} 
                  label="Zipcode" 
                  placeholder="20742"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  required
                />
              )}
            />
          </div>
          
          <FormItem className="flex gap-4 pt-4 mx-5">
            <Button 
              type="button" 
              onClick={handleBack} 
              variant="outline" 
              className="flex-1 h-14 rounded-xl border-2 border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] font-bold text-lg"
            >
              <ChevronLeftIcon className="mr-2 h-6 w-6" />
              Back
            </Button>
            
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  size="lg" 
                  className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg"
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