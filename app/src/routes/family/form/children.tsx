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
import { childrenFormSchema } from '@/lib/formSchemas';
import { User, Stethoscope, Building2, UserCog } from 'lucide-react';
import { useEffect } from 'react';
import { FormProgressBar } from '@/components/form/FormProgressBar';
import { useProgressBarNavigation } from '@/hooks/form/FormHooks';


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

  
  useEffect(() => {
    if (form.state.values.children.length > form.state.values.numChildren) {
      const newChildren = form.state.values.children.slice(0, form.state.values.numChildren);
      form.setFieldValue('children', newChildren);
    }
  }, [form.state.values.numChildren]);

  useEffect(() => {
    if (form.state.values.siblings.length > form.state.values.numSiblings) {
      const newSiblings = form.state.values.siblings.slice(0, form.state.values.numSiblings);
      form.setFieldValue('siblings', newSiblings);
    }
  }, [form.state.values.numSiblings]);


  const handleProgressBarNavigate = useProgressBarNavigation(
    "children",  // section key
    () => form.state.values  // Current form values
  );

  <FormProgressBar onNavigate={handleProgressBarNavigate} />

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("children", currentValues);
    navigate({ to: "/family/form/general-info" });
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <FormProgressBar />
        <CardDescription className="text-center">Fill all required fields to go to next step<span className="text-destructive">*</span></CardDescription> 
      </CardHeader>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-10"
      >
      <CardContent className="space-y-6">
        {/* Multiple Children Question */}
        <div>
          <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
              <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">Child Details</h2>
          </div>
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
                    onChange={() => {
                      field.handleChange(false);
                      form.setFieldValue('numChildren', 1);
                      const currentChildren = form.getFieldValue('children') || [];
                      if (currentChildren.length > 1) {
                        form.setFieldValue("children", [currentChildren[0]]);
                      }
                    }}
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

        <form.Subscribe
          selector={(state) => state.values.hasMultipleChildren}
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
                      onValueChange={(val: string) => {
                        const newCount = Number(val);
                        const currentChildren = form.getFieldValue('children') || [];
                        if (currentChildren.length > newCount) {
                          form.setFieldValue('children', currentChildren.slice(0, newCount));
                        }
                      }}
                      required
                    />
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
                          <FormSelect
                            field={field}
                            label="Age"
                            placeholder="Select Age"
                            values={Array.from({ length: 18 }, (_, i) => String(i + 1))}
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
                          📷 Upload Photo for {form.state.values.children?.[index]?.name || "Child"}
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
                        onChange={() => {
                          field.handleChange(false);
                          form.setFieldValue('numSiblings', 0);
                          form.setFieldValue('siblings', []);
                        }}
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
            <form.Subscribe
              selector={(state) => state.values.hasSiblings}
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
                          onValueChange={(val: string) => {
                            const newCount = Number(val);
                            const currentSiblings = form.getFieldValue('siblings') || [];
                            if (currentSiblings.length > newCount) {
                              form.setFieldValue('siblings', currentSiblings.slice(0, newCount));
                            }
                          }}
                          required
                        />
                      )}
                    />
                  </div>
                );
              }}
            />

            <form.Subscribe
              selector={(state) => [state.values.hasSiblings, state.values.numSiblings]}
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
                            📷 Upload Photo for {form.state.values.siblings?.[index]?.name || "Sibling"}
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
            children={([canSubmit, isSubmitting, isPristine]) => (
              <Button 
                type="submit" 
                disabled={!canSubmit || isPristine}
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