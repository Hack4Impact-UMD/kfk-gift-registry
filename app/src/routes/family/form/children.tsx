import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from "@tanstack/react-form"
import { useFormContext } from "@/components/providers/FormProvider";
import { FormFieldInput, FormSelect, FormButton, FormCheckbox } from "@/components/form/formcomponents";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import "@/styles.css";
import KFKLogo from "@/assets/kisses-for-kyle-logo.png";
import { childrenFormSchema } from '@/lib/formSchemas';
import { User, Stethoscope, Building2, UserCog } from 'lucide-react';
import { FormItem } from '@/components/ui/form';

export const Route = createFileRoute('/family/form/children')({
  component: ChildrenPageComponent,
})

function ChildrenPageComponent() {
  const { formState, updateSection } = useFormContext();
  const navigate = useNavigate();
  
  const form = useForm({
    defaultValues: formState.children || {
      hasMultipleChildren: false,
      numChildren: 1,
      children: [],
      hasSiblings: false,
      numSiblings: 0,
      siblings: [],
      consentPhotosPublic: false,
    },
    onSubmit: async ({ value }) => {
      const result = childrenFormSchema.safeParse(value);
      if (!result.success) {
        const firstError = result.error.issues[0];
        alert(`Error: ${firstError.message}`);
        return;
      }
      updateSection("children", result.data);
      navigate({ to: "/family/form/gift-details" });
    },
  })

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("children", currentValues);
    navigate({ to: "/family/form/general-info" });
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <img src={KFKLogo} className="w-50 m-auto" alt="Kisses for Kyle Logo" />
        <CardTitle className="font-bold text-[var(--color-kfk-blue)] text-2xl text-center my-5">
          Child Details
        </CardTitle>
        <CardDescription className="text-center">
          Fill all required fields to go to next step*
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
      <CardContent className="space-y-6">
        {/* Multiple Children Question */}
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
                    checked={field.state.value === false}
                    onChange={() => field.handleChange(false)}
                    className="mt-0.5"
                  />
                  <span className="text-sm">
                    No, only one child has been diagnosed with cancer.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="hasMultipleChildren"
                    checked={field.state.value === true}
                    onChange={() => field.handleChange(true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm">
                    Yes, more than one child has been diagnosed with cancer.
                  </span>
                </label>
              </div>
            )}
          />
        </div>

        {/* NEW: Conditional Dropdown using form.Subscribe */}
        <form.Subscribe
          selector={(state) => state.values.hasMultipleChildren}
          children={(hasMultipleChildren) => {
            // If "No" is selected (false), don't show the dropdown
            if (!hasMultipleChildren) return null;

            return (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <p className="text-sm font-medium">
                  How many children have been diagnosed?
                </p>
                <form.Field
                  name="numChildren"
                  children={(field) => (
                    <select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="1" disabled>Select amount</option>
                      <option value="2">2 Children</option>
                      <option value="3">3 Children</option>
                      <option value="4">4 Children</option>
                    </select>
                  )}
                />
              </div>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => [state.values.numChildren, state.values.hasMultipleChildren]}
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
                            required
                            Icon={User}
                          />
                        )}
                      />

                      {/* Child Age */}
                      <form.Field
                        name={`children[${index}].age`}
                        children={(field) => (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Age *</label>
                            <select
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white"
                            >
                              <option value="">Select Age</option>
                              {Array.from({ length: 18 }, (_, i) => i + 1).map((age) => (
                                <option key={age} value={age}>{age} years old</option>
                              ))}
                            </select>
                          </div>
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
                            required
                            Icon={Stethoscope}
                          />
                        )}
                      />

                      {/* ... (Include your Hospital and Social Worker fields here using index) */}
                      
                      {/* Photo Upload Section */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
                        <p className="text-sm font-medium mb-1">Child Photo</p>
                        <p className="text-xs text-gray-500 mb-3">
                          Photos increase the chance of gift fulfillment.
                        </p>
                        <Button type="button" variant="outline" className="w-full bg-white">
                          📷 Upload Photo for {form.getFieldValue(`children[${index}].name`) || "Child"}
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
            <h3 className="font-semibold text-lg mb-4 text-[var(--color-kfk-blue)]">
              Sibling Details
            </h3>

            <div>
              <p className="text-sm font-medium mb-3">
                Does your children have any other siblings?
              </p>
              <form.Field
                name="hasSiblings"
                children={(field) => (
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSiblings"
                        checked={field.state.value === true}
                        onChange={() => field.handleChange(true)}
                        className="mt-0.5"
                      />
                      <span className="text-sm">
                        Yes they have more sibling(s).
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSiblings"
                        checked={field.state.value === false}
                        onChange={() => field.handleChange(false)}
                        className="mt-0.5"
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
            {form.state.values.hasSiblings && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    How many siblings? *
                  </label>
                  <form.Field
                    name="numSiblings"
                    children={(field) => (
                      <select
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        className="w-full h-11 px-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="1">1 sibling</option>
                        <option value="2">2 siblings</option>
                        <option value="3">3 siblings</option>
                        <option value="4">4 siblings</option>
                        <option value="5">5 siblings</option>
                      </select>
                    )}
                  />
                </div>

                {/* Dynamically render sibling sections */}
                {form.state.values.numSiblings > 0 && Array.from({ length: form.state.values.numSiblings }).map((_, index) => (
                  <div key={index} className="border-t pt-4">
                    <h4 className="font-medium mb-3">Sibling #{index + 1} Information</h4>
                    
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
                            required
                          />
                        )}
                      />

                      <form.Field
                        name={`siblings[${index}].age`}
                        children={(field) => (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Sibling #{index + 1} Age *
                            </label>
                            <select
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className="w-full h-11 px-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select</option>
                              {Array.from({ length: 18 }, (_, i) => i + 1).map(age => (
                                <option key={age} value={age}>{age} years old</option>
                              ))}
                            </select>
                          </div>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        📷 Upload Photo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo Consent */}
          <div className="border-t pt-6">
            <form.Field
              name="consentPhotosPublic"
              children={(field) => (
                <FormCheckbox field={field}>
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

        <CardFooter className="flex gap-4 pt-4 mx-5">
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
        </CardFooter>
      </form>
    </Card>
  )
}