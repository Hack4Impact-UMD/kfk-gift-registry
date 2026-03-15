import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Building2, Stethoscope, User, UserCog } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useFormContext } from "@/components/providers/FormProvider";
import {
  FormCheckbox,
  FormFieldInput,
  FormSelect,
} from "@/components/form/formcomponents";
import { PhotoUpload } from "@/components/form/PhotoUpload";
import { Button } from "@/components/ui/button";
import { FormProgressBar } from "@/components/form/FormProgressBar";
import {
  useChildrenForm,
  useProgressBarNavigation,
} from "@/hooks/form/FormHooks";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/family/drive/$driveId/form/children")({
  component: ChildrenPageComponent,
});

const CHILD_STATUS_OPTIONS = [
  "Recently diagnosed or relapse with cancer (within 1 year)",
  "Diagnosed and has been in treatment for more than 1 year",
  "Recently off treatment (within 1 year)",
  "Off treatment (more than 1 year)",
  "Sibling of child diagnosed with cancer (in or off treatment)",
  "Bereaved sibling",
];
 
const TREATMENT_LENGTH_OPTIONS = [
  "Less than 6 months",
  "6 months to a year",
  "1-2 years",
  "3-4 years",
  "5+ years",
];

function ChildrenPageComponent() {
  const { updateSection } = useFormContext();
  const navigate = useNavigate();
  const { driveId } = Route.useParams();

  const { form, handleNext } = useChildrenForm();

  const handleProgressBarNavigate = useProgressBarNavigation(
    "children",
    () => form.state.values,
  );

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("children", currentValues);
    navigate({
      to: "/family/drive/$driveId/form/general-info",
      params: {
        driveId,
      },
    });
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardDescription className="text-center">
          Fill all required fields to go to next step
          <span className="text-destructive">*</span>
        </CardDescription>
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
          {/* <div>
            <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
              <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">
                Child Details
              </h2>
            </div>
            <p className="text-sm font-medium mb-3">
              How many children are you applying for?
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
                        form.setFieldValue("hasMultipleChildren", false);
                        form.setFieldValue("numChildren", 1);
                        form.setFieldValue("children", [
                          {
                            name: "",
                            age: "",
                            diagnosis: "",
                            hospitalTreatedAt: "",
                            socialWorkerName: "",
                            photoUrl: "",
                          },
                        ]);
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
          </div> */}

          <div>
            <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
              <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">
                Child Details
              </h2>
            </div>
            <form.Field
              name="numChildren"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value === 0)
                    return "Please enter number of children";
                  if (Number(value) < 1 || Number(value) > 10)
                    return "Please enter a number between 1 and 10";
                  return undefined;
                },
              }}
              children={(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    How many children are you applying for?
                    <span className="text-destructive"> *</span>
                  </label>
                  <div className="relative py-2">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-700" />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="e.g. 2"
                      value={field.state.value || ""}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      onBlur={field.handleBlur}
                      className="w-32 h-11 pl-12 pr-4 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-[var(--color-kfk-blue)]"
                    />
                  </div>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors?.[0] && (
                      <span className="text-sm text-red-500">
                        {field.state.meta.errors[0]}
                      </span>
                    )}
                </div>
              )}
            />
          </div>

          <form.Subscribe
            selector={(state) => state.values.numChildren}
            children={(numChildren) => {
              const displayCount = Number(numChildren) || 1;

              return (
                <div className="space-y-8">
                  {Array.from({ length: displayCount }).map((_, index) => (
                    <div
                      key={index}
                      className={index > 0 ? "border-t pt-8 mt-8" : ""}
                    >
                      <h3 className="font-semibold text-lg mb-4 text-[var(--color-kfk-blue)] flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Child {displayCount > 1 ? `#${index + 1}` : ""}{" "}
                        Information
                      </h3>

                      <div className="space-y-4">
                        {/* Child Status Dropdown */}
                        <form.Field
                          name={`children[${index}].status` as any}
                          validators={{
                            onChange: ({ value }) => {
                              if (!value) return "Please select an option";
                              return undefined;
                            },
                          }}
                          children={(field) => (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Please indicate which option best applies to
                                your child.
                                <span className="text-destructive"> *</span>
                              </label>
                              <FormSelect
                                field={field}
                                label="Select"
                                placeholder="Select"
                                values={CHILD_STATUS_OPTIONS}
                                required
                              />
                            </div>
                          )}
                        />

                        {/* Child Name */}
                        <form.Field
                          name={`children[${index}].name` as any}
                          validators={{
                            onChange: ({ value }) => {
                              if (!value) return "Child's name is required";
                              if (value.length > 100) return "Name is too long";
                              return undefined;
                            },
                          }}
                          children={(field) => (
                            <FormFieldInput
                              field={field}
                              label={
                                displayCount > 1
                                  ? `Child #${index + 1} Name`
                                  : "Child's Name"
                              }
                              placeholder="e.g. Jake Doe"
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
                            },
                          }}
                          children={(field) => (
                            <FormSelect
                              field={field}
                              label={
                                displayCount > 1
                                  ? `Child #${index + 1} Age`
                                  : "Age"
                              }
                              placeholder="Select Age"
                              values={Array.from({ length: 18 }, (_, i) =>
                                String(i + 1),
                              )}
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
                              if (value.length > 200)
                                return "Diagnosis is too long";
                              return undefined;
                            },
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

                        {/* Length of Treatment */}
                        <form.Field
                          name={`children[${index}].treatmentLength` as any}
                          validators={{
                            onChange: ({ value }) => {
                              if (!value)
                                return "Please select treatment length";
                              return undefined;
                            },
                          }}
                          children={(field) => (
                            <div className="space-y-1">
                              <label className="text-sm font-medium">
                                How long has your child been off of treatment?
                                <span className="text-destructive"> *</span>
                              </label>
                              <FormSelect
                                field={field}
                                label="Select"
                                placeholder="Select"
                                values={TREATMENT_LENGTH_OPTIONS}
                                required
                              />
                            </div>
                          )}
                        />

                        <form.Field
                          name={`children[${index}].hospitalTreatedAt` as any}
                          validators={{
                            onChange: ({ value }) => {
                              if (!value) return "Hospital name is required";
                              if (value.length > 200)
                                return "Hospital name is too long";
                              return undefined;
                            },
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
                              if (!value)
                                return "Social worker name is required";
                              if (value.length > 100) return "Name is too long";
                              return undefined;
                            },
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

                        {/* Child Photo + Note */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-[var(--color-kfk-blue)]">
                            Please upload a photo of your child.
                          </p>
                          <div className="border-2 border-kfk-yellow rounded-lg p-4 bg-yellow-50 space-y-3 text-sm">
                            <p className="font-bold">
                              Please Note: Photos will be publicly displayed on
                              our Holiday Gift Drive website.
                            </p>
                            <p>
                              While submitting a photo is not required to
                              participate, it increases your child's chances of
                              receiving gifts. If no photo is provided, the
                              Kisses for Kyle logo will be displayed instead.
                            </p>
                          </div>
                          <form.Field
                            name={`children[${index}].photoUrl` as any}
                            children={(field) => (
                              <PhotoUpload
                                field={field}
                                label=""
                                childName={
                                  form.state.values.children[index]?.name ||
                                  `Child ${index + 1}`
                                }
                              />
                            )}
                          />
                        </div>

                        {/* Child Blurb */}
                        <form.Field
                          name={`children[${index}].blurb` as any}
                          validators={{
                            onChange: ({ value }) => {
                              if (!value) return undefined;
                              const wordCount = value
                                .trim()
                                .split(/\s+/)
                                .filter(Boolean).length;
                              if (wordCount > 50)
                                return "Please keep your blurb to 50 words or less";
                              return undefined;
                            },
                          }}
                          children={(field) => {
                            const wordCount = field.state.value
                              ? field.state.value
                                  .trim()
                                  .split(/\s+/)
                                  .filter(Boolean).length
                              : 0;
                            return (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-[var(--color-kfk-blue)]">
                                  You may write a blurb about your child to be
                                  displayed on the gift drive website (50 words
                                  or less)
                                </p>
                                <Textarea
                                  placeholder="You can share details like your child's activities, interests, favorite color, or anything else you'd like to include."
                                  value={field.state.value || ""}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value as any)
                                  }
                                  onBlur={field.handleBlur}
                                  className="resize-none min-h-[100px]"
                                />
                                <p className="text-xs text-right text-slate-500">
                                  {wordCount} out of 50
                                </p>
                                {field.state.meta.isTouched &&
                                  field.state.meta.errors?.[0] && (
                                    <span className="text-sm text-red-500">
                                      {field.state.meta.errors[0]}
                                    </span>
                                  )}
                              </div>
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }}
          />

          {/* Additional Comments */}
          <form.Field
            name={"additionalNotes" as any}
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const wordCount = value
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;
                if (wordCount > 100)
                  return "Please keep your notes to 100 words or less";
                return undefined;
              },
            }}
            children={(field) => {
              const wordCount = field.state.value
                ? field.state.value
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean).length
                : 0;
              return (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--color-kfk-blue)]">
                    Do you have any additional notes for the
                    Kisses for Kyle team? These will not appear
                    on the gift drive page.
                  </p>
                  <Textarea
                    placeholder="e.g. Any information you would like the Kisses for Kyle team to know."
                    value={field.state.value || ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value as any)
                    }
                    onBlur={field.handleBlur}
                    className="resize-none min-h-[120px]"
                  />
                  <p className="text-xs text-right text-slate-500">
                    {wordCount} out of 100
                  </p>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors?.[0] && (
                      <span className="text-sm text-red-500">
                        {field.state.meta.errors[0]}
                      </span>
                    )}
                </div>
              );
            }}
          />

          {/* Photo Consent */}
          <div className="border-t pt-6">
            <form.Field
              name="consentPhotosPublic"
              children={(field) => (
                <FormCheckbox field={field}>
                  I consent to having all photos publicly posted on the Kisses
                  for Kyle Holiday Gift Drive website.
                </FormCheckbox>
              )}
            />
            <p className="text-xs text-gray-500 mt-2">
              For any questions or concerns please email us at:{" "}
              <a
                href="mailto:info@kissesforkyle.org"
                className="underline text-blue-600"
              >
                holidaygiftdrive@kissesforkyle.org
              </a>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-4 pt-4 mx-5">
          <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            className="flex-1 h-14 rounded-xl border-2 border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] font-bold text-lg"
          >
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
  );
}
