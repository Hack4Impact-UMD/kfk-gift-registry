import { Building2, Stethoscope, User, UserCog } from "lucide-react";
import { PhotoUpload } from "../PhotoUpload";
import type { useChildrenForm } from "@/hooks/family-form/formHooks";
import { Textarea } from "@/components/ui/textarea";

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

type ChildInfoFormProps = {
  disabled?: boolean;
  childForm: ReturnType<typeof useChildrenForm>;
};

export function ChildInfoForm({
  childForm,
  disabled = false,
}: ChildInfoFormProps) {
  const form = childForm.form;
  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="border-b-2 border-kfk-blue w-full mb-8">
          <h2 className="text-xl font-bold text-kfk-blue pb-1">
            Child Details
          </h2>
        </div>
        <form.AppField
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
        >
          {(field) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                How many children from your family are participating in the gift
                drive?
                <span className="text-destructive"> *</span>
              </label>
              <div className="relative py-2">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-700" />
                <input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="e.g. 2"
                  value={(field.state.value as any) ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    field.handleChange(raw === "" ? ("" as any) : Number(raw));
                  }}
                  onBlur={field.handleBlur}
                  disabled={disabled}
                  className="w-32 h-11 pl-12 pr-4 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-kfk-blue truncate disabled:opacity-50"
                />
              </div>
              {field.state.meta.isTouched && field.state.meta.errors[0] && (
                <span className="text-sm text-red-500">
                  {field.state.meta.errors[0]}
                </span>
              )}
            </div>
          )}
        </form.AppField>
      </div>

      <form.Subscribe
        selector={(state) => state.values.numChildren}
        children={(numChildren) => {
          const displayCount = Number(numChildren) || 1;

          return (
            <div className="space-y-8">
              {Array.from({ length: displayCount }).map((__, index) => (
                <div
                  key={index}
                  className={index > 0 ? "border-t pt-8 mt-8" : ""}
                >
                  <h3 className="font-semibold text-lg mb-4 text-kfk-blue flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Child {displayCount > 1 ? `#${index + 1}` : ""} Information
                  </h3>

                  <div className="space-y-4">
                    {/* Child Status Dropdown */}
                    <form.AppField
                      name={`children[${index}].status`}
                      validators={{
                        onChange: ({ value }) => {
                          if (!value) return "Please select an option";
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Please indicate which option best applies to your
                            child.
                            <span className="text-destructive"> *</span>
                          </label>
                          <div className="-mt-2 w-full [&>div]:max-w-full [&>div]:w-full">
                            <field.FormSelect
                              label="Select"
                              placeholder="Select"
                              values={CHILD_STATUS_OPTIONS}
                              required
                              disabled={disabled}
                            />
                          </div>
                        </div>
                      )}
                    </form.AppField>

                    {/* Child Name */}
                    <form.AppField
                      name={`children[${index}].name`}
                      validators={{
                        onChange: ({ value }: { value: string }) => {
                          if (!value) return "Child's name is required";
                          if (value.length > 100) return "Name is too long";
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <field.FormFieldInput
                          label={
                            displayCount > 1
                              ? `Child #${index + 1} Name`
                              : "Child's Name"
                          }
                          placeholder="e.g. Jake Doe"
                          required
                          disabled={disabled}
                          Icon={User}
                        />
                      )}
                    </form.AppField>

                    {/* Child Age */}
                    <form.AppField
                      name={`children[${index}].age`}
                      validators={{
                        onChange: ({ value }) => {
                          if (!value) return "Age is required";
                          return undefined;
                        },
                      }}
                    >
                      {(field) => (
                        <field.FormSelect
                          label={
                            displayCount > 1 ? `Child #${index + 1} Age` : "Age"
                          }
                          placeholder="Select Age"
                          values={Array.from({ length: 18 }, (_unused, i) =>
                            String(i + 1),
                          )}
                          required
                          disabled={disabled}
                        />
                      )}
                    </form.AppField>

                    {/* Diagnosis, Treatment, Hospital, Social Worker - hidden for siblings */}
                    <form.Subscribe
                      selector={(state) => state.values.children[index]?.status}
                      children={(status) => {
                        const isSibling =
                          status ===
                            "Sibling of child diagnosed with cancer (in or off treatment)" ||
                          status === "Bereaved sibling";

                        if (isSibling) return null;

                        return (
                          <div className="space-y-4">
                            {/* Diagnosis */}
                            <form.AppField
                              name={`children[${index}].diagnosis`}
                              validators={{
                                onChange: ({ value }) => {
                                  if (!value) return "Diagnosis is required";
                                  if (value.length > 200)
                                    return "Diagnosis is too long";
                                  return undefined;
                                },
                              }}
                            >
                              {(field) => (
                                <field.FormFieldInput
                                  label="Diagnosis"
                                  placeholder="e.g. Leukemia"
                                  required
                                  disabled={disabled}
                                  Icon={Stethoscope}
                                />
                              )}
                            </form.AppField>

                            {/* Length of Treatment */}
                            {(status ===
                              "Recently off treatment (within 1 year)" ||
                              status ===
                                "Off treatment (more than 1 year)") && (
                              <form.AppField
                                name={`children[${index}].treatmentLength`}
                                validators={{
                                  onChange: ({ value }) => {
                                    if (!value)
                                      return "Please select treatment length";
                                    return undefined;
                                  },
                                }}
                              >
                                {(field) => (
                                  <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                      How long has your child been off of
                                      treatment?
                                      <span className="text-destructive">
                                        {" "}
                                        *
                                      </span>
                                    </label>
                                    <div className="-mt-2">
                                      <field.FormSelect
                                        label="Select"
                                        placeholder="Select"
                                        values={TREATMENT_LENGTH_OPTIONS}
                                        required
                                        disabled={disabled}
                                      />
                                    </div>
                                  </div>
                                )}
                              </form.AppField>
                            )}

                            {/* Hospital */}
                            <form.AppField
                              name={`children[${index}].hospitalTreatedAt`}
                              validators={{
                                onChange: ({ value }) => {
                                  const v = (value ?? "").trim();
                                  if (v.length > 200)
                                    return "Hospital name is too long";
                                  return undefined;
                                },
                              }}
                            >
                              {(field) => (
                                <field.FormFieldInput
                                  label="Hospital Treated At"
                                  placeholder="e.g. Johns Hopkins"
                                  disabled={disabled}
                                  Icon={Building2}
                                />
                              )}
                            </form.AppField>

                            {/* Social Worker */}
                            <form.AppField
                              name={`children[${index}].socialWorkerName`}
                              validators={{
                                onChange: ({ value }) => {
                                  const v = (value ?? "").trim();
                                  if (v.length > 100) return "Name is too long";
                                  return undefined;
                                },
                              }}
                            >
                              {(field) => (
                                <field.FormFieldInput
                                  label="Social Worker Name"
                                  placeholder="e.g. Sarah Smith"
                                  disabled={disabled}
                                  Icon={UserCog}
                                />
                              )}
                            </form.AppField>
                          </div>
                        );
                      }}
                    />

                    {/* Child Photo + Note */}
                    <div className="space-y-3">
                      {!disabled && (
                        <>
                          <p className="text-sm font-medium text-kfk-blue">
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
                        </>
                      )}
                      <form.AppField name={`children[${index}].photoUrl`}>
                        {(field) => (
                          <PhotoUpload
                            field={field}
                            label=""
                            childName={
                              form.state.values.children[index]?.name ||
                              `Child ${index + 1}`
                            }
                            disabled={disabled}
                          />
                        )}
                      </form.AppField>
                    </div>

                    {/* Child Blurb */}
                    <form.AppField
                      name={`children[${index}].blurb`}
                      validators={{
                        onChange: ({ value }) => {
                          if (!value) return undefined;
                          const wordCount = value
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean).length;
                          if (wordCount > 25)
                            return "Please keep your blurb to 25 words or less";
                          return undefined;
                        },
                      }}
                    >
                      {(field) => {
                        const wordCount = field.state.value
                          ? field.state.value
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean).length
                          : 0;
                        return (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-kfk-blue">
                              You may write a blurb about your child to be
                              displayed on the gift drive website (25 words or
                              less)
                            </p>
                            <Textarea
                              placeholder="You can share details like your child's activities, interests, favorite color, or anything else you'd like to include."
                              value={field.state.value || ""}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              disabled={disabled}
                              className="resize-none min-h-[100px]"
                            />
                            {!disabled && (
                              <p className="text-xs text-right text-slate-500">
                                {wordCount} out of 25
                              </p>
                            )}
                            {field.state.meta.isTouched &&
                              field.state.meta.errors[0] && (
                                <span className="text-sm text-red-500">
                                  {field.state.meta.errors[0]}
                                </span>
                              )}
                          </div>
                        );
                      }}
                    </form.AppField>
                  </div>
                </div>
              ))}
            </div>
          );
        }}
      />

      {/* Additional Comments */}
      <form.AppField
        name="additionalNotes"
        validators={{
          onChange: ({ value }) => {
            if (typeof value !== "string" || !value) return undefined;
            const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
            if (wordCount > 100)
              return "Please keep your notes to 100 words or less";
            return undefined;
          },
        }}
      >
        {(field) => {
          const wordCount = field.state.value
            ? field.state.value.trim().split(/\s+/).filter(Boolean).length
            : 0;
          return (
            <div className="space-y-2">
              <p className="text-sm font-medium text-kfk-blue">
                Do you have any additional notes for the Kisses for Kyle team?
                These will not appear on the gift drive page.
              </p>
              <Textarea
                placeholder="e.g. Any information you would like the Kisses for Kyle team to know."
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                disabled={disabled}
                className="resize-none min-h-30"
              />
              {!disabled && (
                <p className="text-xs text-right text-slate-500">
                  {wordCount} out of 100
                </p>
              )}
              {field.state.meta.isTouched && field.state.meta.errors[0] && (
                <span className="text-sm text-red-500">
                  {field.state.meta.errors[0]}
                </span>
              )}
            </div>
          );
        }}
      </form.AppField>

      {/* Photo Consent */}
      <div className="border-t pt-6">
        <form.AppField name="consentPhotosPublic">
          {(field) => (
            <field.FormCheckbox disabled={disabled}>
              I consent to having all photos publicly posted on the Kisses for
              Kyle Holiday Gift Drive website.
            </field.FormCheckbox>
          )}
        </form.AppField>
        <p className="text-xs text-gray-500 mt-2">
          For any questions or concerns please email us at:{" "}
          <a
            href="mailto:info@kissesforkyle.org"
            className="underline text-blue-600"
          >
            info@kissesforkyle.org
          </a>
        </p>
      </div>
    </div>
  );
}
