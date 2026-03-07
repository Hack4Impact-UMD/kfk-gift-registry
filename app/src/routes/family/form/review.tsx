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

import { Building2, GiftIcon, Stethoscope, User, UserCog } from "lucide-react"
import { FormCheckbox, FormFieldInput, FormSelect } from "@/components/form/formcomponents"
import { US_STATES } from "@/lib/formSchemas"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { FamilyFormState, useFormContext } from "@/components/providers/FormProvider";
import { FormItem } from "@/components/ui/form"
import { FormProgressBar } from "@/components/form/FormProgressBar"
import { useProgressBarNavigation } from "@/hooks/form/FormHooks"



export const Route = createFileRoute('/family/form/review')({
  component: RouteComponent,
})

function RouteComponent() {

    const { updateSection, formState } = useFormContext();
    const navigate = useNavigate();
    const form = useForm({
    onSubmit: async ({ value }) => {
        alert("Submitted!")
    },
    })

    const handleProgressBarNavigate = async (targetPath: string) => {
      navigate({ to: targetPath as any });
    };

    

    const handleBack = () => {
      const currentValues = form.state.values;
      navigate({ to: "/family/form/consent" });
    }


  return (

    
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <FormProgressBar onNavigate={handleProgressBarNavigate} />
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
            <div className="flex justify-between border-b-1 border-[var(--color-kfk-blue)] w-full mb-8">
              <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">General Information</h2>
              <button type="button" onClick={() => {navigate({ to: "/family/form/general-info" })}} className="text-sm h-5 my-auto cursor-pointer transition duration-200 ease-in-out hover:bg-[var(--color-kfk-blue)] hover:text-white text-[var(--color-kfk-blue)] border border-[var(--color-kfk-blue)] px-4 rounded-md">Review</button>
            </div>
          <form.Field
            name="parentName"
            children={(field) => (
              <FormFieldInput field={field} Icon={UsersIcon} label="Your Name (Parent/Guardian)" placeholder="Jane Doe" value={formState.generalInfo?.parentName} disabled required/>
            )}
          />
          <form.Field
            name="email"
            children={(field) => (
              <FormFieldInput field={field} Icon={EnvelopeIcon} label="Enter Email" placeholder="e.g. janedoe@gmail.com" value={formState.generalInfo?.email} disabled required/>
            )}
          />
          <form.Field
            name="emailConfirm"
            children={(field) => (
              <FormFieldInput field={field} Icon={EnvelopeIcon} label="Re-enter Email" placeholder="e.g. janedoe@gmail.com" value={formState.generalInfo?.emailConfirm} disabled required/>
            )}
          />
          <form.Field name="phoneNumber" children={(field) => (
              <FormFieldInput field={field} Icon={PhoneIcon} label="Phone Number" placeholder="(555)-5555-555" value={formState.generalInfo?.phoneNumber} disabled required/>
            )}
          />
          <form.Field name="phoneNumberConfirm" children={(field) => (
              <FormFieldInput field={field} Icon={PhoneIcon} label="Re-enter Phone Number" placeholder="(555)-5555-555" value={formState.generalInfo?.phoneNumber} disabled required/>
            )}
          />
          </div>
          
          <div>
            <div className="flex justify-between border-b-1 border-[var(--color-kfk-blue)] w-full mb-8">
              <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">Address</h2>
              <button type="button" onClick={() => {navigate({ to: "/family/form/general-info" })}} className="text-sm h-5 my-auto cursor-pointer transition duration-200 ease-in-out hover:bg-[var(--color-kfk-blue)] hover:text-white text-[var(--color-kfk-blue)] border border-[var(--color-kfk-blue)] px-4 rounded-md">Review</button>
            </div>
            <form.Field name="streetAddress" children={(field) => (
              <FormFieldInput field={field} Icon={MapPinIcon} label="Street Address" placeholder="10 Mountain View Way" value={formState.generalInfo?.streetAddress} disabled required/>
              )}
            />
            <form.Field name="addressLine2" children={(field) => (
              <FormFieldInput field={field} Icon={MapPinIcon} label="Address Line 2" placeholder="Apt. J" value={formState.generalInfo?.addressLine2} disabled required/>
              )}
            />
            <form.Field name="city" children={(field) => (
              <FormFieldInput field={field} Icon={MapPinIcon} label="City" placeholder="Baltimore" value={formState.generalInfo?.city} disabled required/>
              )}
            />
            <form.Field name="state" children={(field) => (
              <FormSelect
                                field={field}
                                label="State"
                                placeholder="Select State"
                                values={US_STATES}
                                value={formState.generalInfo?.state}
                                required
                                disabled
                              />
              )}
            />
            <form.Field name="zipCode" children={(field) => (
              <FormFieldInput field={field} Icon={MapPinIcon} label="Zipcode" placeholder="10101" value={formState.generalInfo?.zipCode} disabled required/>
              )}
            />
          </div>
          
        </form>
      </CardContent>

      <CardContent className="space-y-6">

      {/* Multiple Children Question */}
        <div className="flex justify-between border-b-1 border-[var(--color-kfk-blue)] w-full mb-8">
          <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">General Details</h2>
          <button type="button" onClick={() => {navigate({ to: "/family/form/children" })}} className="text-sm h-5 my-auto cursor-pointer transition duration-200 ease-in-out hover:bg-[var(--color-kfk-blue)] hover:text-white text-[var(--color-kfk-blue)] border border-[var(--color-kfk-blue)] px-4 rounded-md">Review</button>
        </div>
        <div>
          <p className="text-sm font-medium mb-3">
            Have more than one of your children been diagnosed with cancer?
          </p>
          <form.Field
            name="hasMultipleChildren"
            children={(field) => (
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="hasMultipleChildren"
                    checked={formState.children?.hasMultipleChildren === false}
                    className="mt-0.5"
                    disabled
                  />
                  <span className="text-sm">
                    No, only one child has been diagnosed with cancer.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="hasMultipleChildren"
                    checked={formState.children?.hasMultipleChildren === true}
                    className="mt-0.5"
                    disabled
                  />
                  <span className="text-sm">
                    Yes, more than one child has been diagnosed with cancer.
                  </span>
                </label>
              </div>
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => formState.children?.hasMultipleChildren}
          children={(hasMultipleChildren) => {
            // If "No" is selected (false), don't show the dropdown
            if (!hasMultipleChildren) return null;

            return (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <form.Field
                  name="numChildren"
                  children={(field) => (
                    <FormSelect
                      field={field}
                      label="# of Children Diagnosed"
                      placeholder="Select number of children"
                      values={["2", "3", "4"]}
                      required
                    />
                  )}
                />
              </div>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => [formState.children?.numChildren, formState.children?.hasMultipleChildren]}
          children={([numChildren, hasMultipleChildren]) => {
            // Determine how many sections to show. 
            // If "No" is selected, force 1. Otherwise, use numChildren.
            const displayCount = hasMultipleChildren ? (Number(numChildren) || 1) : 1;

            return (
              <div className="space-y-8">
                {Array.from({ length: displayCount }).map((_, index) => (
                  <div key={index} className={index > 0 ? "border-t pt-8 mt-8" : ""}>
                    <h3 className="font-semibold text-lg mb-4 text-[var(--color-kfk-blue)] flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Child {displayCount > 1 ? `#${index + 1}` : ""} Information
                    </h3>

                    <div className="space-y-4">
                      {/* Child Name */}
                      <form.Field
                        name={`children[${index}].name`}
                        children={(field) => (
                          <FormFieldInput
                            field={field}
                            label="Child's Name"
                            placeholder="e.g. Jane Doe"
                            value={formState.children?.children[index].name} 
                            disabled 
                            required
                            Icon={User}
                          />
                        )}
                      />

                      {/* Child Age */}
                      <form.Field
                        name={`children[${index}].age`}
                        children={(field) => (
                          <FormSelect
                            field={field}
                            label="Age"
                            placeholder="Select Age"
                            values={Array.from({ length: 18 }, (_, i) => String(i + 1))}
                            value={formState.children?.children[index].age}
                            disabled
                            required
                          />
                        )}
                      />

                      {/* Diagnosis */}
                      <form.Field
                        name={`children[${index}].diagnosis`}
                        children={(field) => (
                          <FormFieldInput
                            field={field}
                            label="Diagnosis"
                            placeholder="e.g. Cancer"
                            value={formState.children?.children[index].diagnosis} 
                            disabled 
                            required
                            Icon={Stethoscope}
                          />
                        )}
                      />

                      <form.Field
                        name={`children[${index}].hospitalTreatedAt`}
                        children={(field) => (
                          <FormFieldInput
                            field={field}
                            label="Hospital Treated At"
                            placeholder="e.g. Johns Hopkins"
                            value={formState.children?.children[index].hospitalTreatedAt} 
                            disabled 
                            required
                            Icon={Building2}
                          />
                        )}
                      />

                      <form.Field
                        name={`children[${index}].socialWorkerName`}
                        children={(field) => (
                          <FormFieldInput
                            field={field}
                            label="Social Worker Name"
                            placeholder="e.g. Sarah Smith"
                            value={formState.children?.children[index].socialWorkerName} 
                            disabled 
                            required
                            Icon={UserCog}
                          />
                        )}
                      />

                      
                      {/* Photo Upload Section */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                        <p className="text-sm font-medium mb-1">Child Photo</p>
                        <p className="text-xs text-gray-500 mb-3">
                          Photos increase the chance of gift fulfillment.
                        </p>
                        <Button type="button" variant="outline" className="w-full bg-white">
                          📷 Upload Photo for {formState.children?.children[index]?.name || "Child"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          }}
        />

          {/* Sibling Details */}
          <div className="border-t pt-6">
            <div className="flex justify-between border-b-1 border-[var(--color-kfk-blue)] w-full mb-8">
              <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">Sibling Information</h2>
              <button type="button" onClick={() => {navigate({ to: "/family/form/children" })}} className="text-sm h-5 my-auto cursor-pointer transition duration-200 ease-in-out hover:bg-[var(--color-kfk-blue)] hover:text-white text-[var(--color-kfk-blue)] border border-[var(--color-kfk-blue)] px-4 rounded-md">Review</button>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">
                Does your child(ren) have any other siblings?
              </p>
              <form.Field
                name="hasSiblings"
                children={(field) => (
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSiblings"
                        checked={formState.children?.hasSiblings === true}
                        onChange={() => field.handleChange(true)}
                        className="mt-0.5"
                        disabled
                      />
                      <span className="text-sm">
                        Yes they have more sibling(s).
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSiblings"
                        checked={formState.children?.hasSiblings === false}
                        className="mt-0.5"
                        disabled
                      />
                      <span className="text-sm">
                        No they don't have more sibling(s).
                      </span>
                    </label>
                  </div>
                )}
              />
            </div>

            {/* Show sibling fields if hasSiblings is true */}
            <form.Subscribe
              selector={(state) => formState.children?.hasSiblings}
              children={(hasSiblings) => {
                if (!hasSiblings) return null;

                return (
                  <div className="mt-4">
                    <form.Field
                      name="numSiblings"
                      children={(field) => (
                        <FormSelect
                          field={field}
                          label="How many siblings?"
                          placeholder="Select amount"
                          values={["1", "2", "3", "4"]}
                          required
                        />
                      )}
                    />
                  </div>
                );
              }}
            />

            <form.Subscribe
              selector={(state) => [formState.children?.hasSiblings, formState.children?.numSiblings]}
              children={([hasSiblings, numSiblings]) => {
                if (!hasSiblings || !numSiblings || numSiblings === 0) return null;

                return (
                  <div className="mt-6 space-y-6">
                    {Array.from({ length: Number(numSiblings || 0) }).map((_, index) => (
                      <div key={index} className="border-t pt-4">
                        <h4 className="font-medium mb-3 text-[var(--color-kfk-blue)]">
                          Sibling #{index + 1} Information
                        </h4>
                        
                        <div className="space-y-4">
                          <form.Field
                            name={`siblings[${index}].name`}
                            children={(field) => (
                              <FormFieldInput
                                field={field}
                                label={`Sibling Name #${index + 1}`}
                                placeholder="e.g. Jane Doe"
                                Icon={User}
                                type="text"
                                value={formState.children?.siblings[index].name} 
                                disabled 
                                required
                              />
                            )}
                          />

                          <form.Field
                            name={`siblings[${index}].age`}
                            children={(field) => (
                              <FormSelect
                                field={field}
                                label={`Sibling #${index + 1} Age`}
                                placeholder="Select Age"
                                values={Array.from({ length: 18 }, (_, i) => String(i + 1))}
                                required
                              />
                            )}
                          />

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            📷 Upload Photo for {formState.children?.siblings[index]?.name || "Sibling"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </div>

          {/* Photo Consent */}
          <div className="border-t pt-6">
            <form.Field
              name="consentPhotosPublic"
              children={(field) => (
                <FormCheckbox field={field} value={formState.children?.consentPhotosPublic} disabled>
                  I consent to having all photos publicly posted on the Kisses for Kyle Holiday Gift Drive website.
                </FormCheckbox>
              )}
            />
            <p className="text-xs text-gray-500 mt-2">
              *All photos or placards please email us at:{" "}
              <a href="mailto:holidaygiftdrive@kissesforkyle.org" className="underline text-blue-600">
                holidaygiftdrive@kissesforkyle.org
              </a>
            </p>
          </div>
        </CardContent>



        
        <CardContent>
        <form className="flex flex-col gap-2">
          
            {formState.gifts?.giftSelections.map((childSelect, activeChildIndex) => {
                return (
                    <>
                    <div className="flex justify-between border-b-1 border-[var(--color-kfk-blue)] w-full mb-8 mt-3">
          <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">{childSelect.childName}'s Gift Selection</h2>
          <button type="button" onClick={() => {navigate({ to: "/family/form/gift-details" })}} className="text-sm h-5 my-auto cursor-pointer transition duration-200 ease-in-out hover:bg-[var(--color-kfk-blue)] hover:text-white text-[var(--color-kfk-blue)] border border-[var(--color-kfk-blue)] px-4 rounded-md">Review</button>
        </div>
                    <div className="flex flex-col gap-7">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <CardDescription className="text-md text-[var(--color-kfk-blue)] -mb-2">Gift #{i + 1}</CardDescription>
                <form.Field name={`giftSelections[${activeChildIndex}].gifts[${i}].giftUrl`}>
                  {(field) => 
                    <FormFieldInput field={field} Icon={GiftIcon} label={`Gift #${i+1} URL`} placeholder="e.g. amazon.com/Monopoly-Family-Board-Players" value={formState.gifts?.giftSelections[activeChildIndex].gifts[i].giftUrl} disabled required={i==0}/>
                  }
                </form.Field>
                <form.Field name={`giftSelections[${activeChildIndex}].gifts[${i}].giftName`}>
                  {(field) => 
                    <FormFieldInput field={field} Icon={GiftIcon} label={`Gift #${i+1} Name`} placeholder="e.g. Monopoly" value={formState.gifts?.giftSelections[activeChildIndex].gifts[i].giftName} disabled required={i==0}/>            
                  }
                </form.Field>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-7 mt-10 mb-4">
          {[0, 1].map((i) => (
              <div key={i}>
                <CardDescription className="text-md text-[var(--color-kfk-blue)] -mb-2">Backup Gift #{i + 1}</CardDescription>
                <form.Field name={`giftSelections[${activeChildIndex}].backupGifts[${i}].giftUrl`}>
                  {(field) => 
                  <FormFieldInput field={field} Icon={GiftIcon} label={`Backup Gift #${i+1} URL`} placeholder="e.g. amazon.com/Monopoly-Family-Board-Players" value={formState.gifts?.giftSelections[activeChildIndex].backupGifts[i].giftUrl} disabled required/>
                  }
                </form.Field>
                <form.Field name={`giftSelections[${activeChildIndex}].backupGifts[${i}].giftName`}>
                  {(field) => 
                    <FormFieldInput field={field} Icon={GiftIcon} label={`Backup Gift #${i+1} Name`} placeholder="e.g. Monopoly" value={formState.gifts?.giftSelections[activeChildIndex].backupGifts[i].giftName} disabled required/> 
                  }
                </form.Field>
              </div>
            ))}
          </div>

          <form.Field name={`giftSelections[${activeChildIndex}].verified`}>
            {(field) => (
              <FormCheckbox field={field} value={formState.gifts?.giftSelections[activeChildIndex].verified} disabled>
                I verify that all selected gifts are $25 or under based on the original price.
              </FormCheckbox>
            )}
          </form.Field>
          </>
                )
            })}
      </form>
      <FormItem className="flex gap-4 pt-4 mx-5 mt-10">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
            children={([canSubmit, isSubmitting]) => (
              <Button 
                type="button"
                disabled={!canSubmit}
                size="lg" className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg"
                onClick={() => form.handleSubmit()}
              >
                {isSubmitting ? '...' : 'Submit!'}
              </Button>
            )}
          />
        </FormItem>
    </CardContent>
    </Card>
  )
}
