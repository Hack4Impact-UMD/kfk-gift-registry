import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useFormContext } from "@/components/providers/FormProvider";
import { FormFieldInput, FormSelect, FormButton, FormCheckbox } from "@/components/form/formcomponents";
import { PhotoUpload } from "@/components/form/PhotoUpload";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import "@/styles.css";
import { User, Stethoscope, Building2, UserCog } from 'lucide-react';
import { FormProgressBar } from '@/components/form/FormProgressBar';
import { useChildrenForm, useProgressBarNavigation } from '@/hooks/form/FormHooks';


export const Route = createFileRoute('/family/form/children')({
  component: ChildrenPageComponent,
})

function ChildrenPageComponent() {
  const { updateSection } = useFormContext();
  const navigate = useNavigate();

  const { form, handleNext } = useChildrenForm();

  const handleProgressBarNavigate = useProgressBarNavigation(
    "children",
    () => form.state.values
  );

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("children", currentValues);
    navigate({ to: "/family/form/general-info" });
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardDescription className="text-center">Fill all required fields to go to next step<span className="text-destructive">*</span></CardDescription> 
        <FormProgressBar onNavigate={handleProgressBarNavigate} />
      </CardHeader>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleNext();
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
                      const firstChild = form.getFieldValue('children')?.[0];
                      form.setFieldValue('hasMultipleChildren', false);
                      form.setFieldValue('numChildren', 1);
                      form.setFieldValue('children', [firstChild || { name: "", age: "", diagnosis: "", hospitalTreatedAt: "", socialWorkerName: "", photoUrl: "" }]);
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
            if (!hasMultipleChildren) return null;

            return (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <form.Field
                  name="numChildren"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value === 0) return 'Please select number of children';
                      return undefined;
                    }
                  }}
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
          selector={(state) => [state.values.numChildren, state.values.hasMultipleChildren]}
          children={([numChildren, hasMultipleChildren]) => {
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
                        name={`children[${index}].name` as any}
                        validators={{
                          onChange: ({ value }) => {
                            if (!value) return "Child's name is required";
                            if (value.length > 100) return "Name is too long";
                            return undefined;
                          }
                        }}
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
                        name={`children[${index}].age` as any}
                        validators={{
                          onChange: ({ value }) => {
                            if (!value) return "Age is required";
                            return undefined;
                          }
                        }}
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
                        name={`children[${index}].diagnosis` as any}
                        validators={{
                          onChange: ({ value }) => {
                            if (!value) return "Diagnosis is required";
                            if (value.length > 200) return "Diagnosis is too long";
                            return undefined;
                          }
                        }}
                        children={(field) => (
                          <FormFieldInput
                            field={field}
                            label="Diagnosis"
                            placeholder="e.g. Leukemia"
                            required
                            Icon={Stethoscope}
                          />
                        )}
                      />

                      <form.Field
                        name={`children[${index}].hospitalTreatedAt` as any}
                        validators={{
                          onChange: ({ value }) => {
                            if (!value) return "Hospital name is required";
                            if (value.length > 200) return "Hospital name is too long";
                            return undefined;
                          }
                        }}
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
                        name={`children[${index}].socialWorkerName` as any}
                        validators={{
                          onChange: ({ value }) => {
                            if (!value) return "Social worker name is required";
                            if (value.length > 100) return "Name is too long";
                            return undefined;
                          }
                        }}
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
                      <form.Field
                        name={`children[${index}].photoUrl` as any}
                        children={(field) => (
                          <PhotoUpload
                            field={field}
                            label="Child Photo"
                            childName={form.state.values.children?.[index]?.name || `Child ${index + 1}`}
                          />
                        )}
                      />
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
                          form.setFieldValue('hasSiblings', false);
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
                      validators={{
                        onChange: ({ value }) => {
                          if (!value || value === 0) return 'Please select number of siblings';
                          return undefined;
                        }
                      }}
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
                            name={`siblings[${index}].name` as any}
                            validators={{
                              onChange: ({ value }) => {
                                if (!value) return "Sibling's name is required";
                                if (value.length > 100) return "Name is too long";
                                return undefined;
                              }
                            }}
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
                            name={`siblings[${index}].age` as any}
                            validators={{
                              onChange: ({ value }) => {
                                if (!value) return "Age is required";
                                return undefined;
                              }
                            }}
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

                          <form.Field
                            name={`siblings[${index}].photoUrl` as any}
                            children={(field) => (
                              <PhotoUpload
                                field={field}
                                label="Sibling Photo"
                                childName={form.state.values.siblings?.[index]?.name || `Sibling ${index + 1}`}
                              />
                            )}
                          />
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
          <Button
            type="submit"
            size="lg"
            className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg"
          >
            Next
            <ChevronRightIcon className="ml-2 h-6 w-6" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}