import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import type { useGeneralInfoForm } from "@/hooks/family-form/formHooks";
import { US_STATES, generalInfoSchema, validateWith } from "@/lib/formSchemas";

type GeneralInfoFormProps = {
  disabled?: boolean;
  form: ReturnType<typeof useGeneralInfoForm>;
};

export function GeneralInfoForm({
  form,
  disabled = false,
}: GeneralInfoFormProps) {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="border-b-2 border-kfk-blue w-full mb-8">
          <h2 className="text-xl font-bold text-kfk-blue pb-1">
            Family Contact Information
          </h2>
        </div>

        <form.AppField
          name="parentName"
          validators={{
            onChange: validateWith(generalInfoSchema.shape.parentName),
          }}
        >
          {(field) => (
            <field.FormFieldInput
              disabled={disabled}
              Icon={UsersIcon}
              label="Your Name (Parent/Guardian)"
              placeholder="Jane Doe"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="email"
          validators={{
            onChange: validateWith(generalInfoSchema.shape.email),
            onChangeAsyncDebounceMs: 400,
          }}
        >
          {(field) => (
            <field.FormFieldInput
              disabled={disabled}
              Icon={EnvelopeIcon}
              label="Enter Email"
              placeholder="e.g. janedoe@gmail.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="emailConfirm"
          validators={{
            onChangeListenTo: ["email"],
            onChange: ({ value, fieldApi }) => {
              const formatError = validateWith(
                generalInfoSchema.shape.emailConfirm,
              )({ value });
              if (formatError) return formatError;
              const normalizedEmail = fieldApi.form
                .getFieldValue("email")
                .trim()
                .toLowerCase();
              if (value.trim().toLowerCase() !== normalizedEmail)
                return "Emails do not match";
              return undefined;
            },
          }}
        >
          {(field) => (
            <field.FormFieldInput
              disabled={disabled}
              Icon={EnvelopeIcon}
              label="Re-enter Email"
              placeholder="e.g. janedoe@gmail.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="phoneNumber"
          validators={{
            onChange: validateWith(generalInfoSchema.shape.phoneNumber),
          }}
        >
          {(field) => (
            <field.FormFieldInput
              Icon={PhoneIcon}
              disabled={disabled}
              label="Phone Number"
              placeholder="(555)-555-5555"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="phoneNumberConfirm"
          validators={{
            onChangeListenTo: ["phoneNumber"],
            onChange: ({ value, fieldApi }) => {
              const phoneNumber = fieldApi.form.getFieldValue("phoneNumber");
              if (!phoneNumber && !value) return undefined;
              if (!value) return "Please confirm your phone number";
              if (!/^[\d\s\-()]+$/.test(value))
                return "Please enter a valid phone number";
              if (value !== phoneNumber) return "Phone numbers do not match";
              return undefined;
            },
          }}
        >
          {(field) => (
            <field.FormFieldInput
              Icon={PhoneIcon}
              disabled={disabled}
              label="Re-enter Phone Number"
              placeholder="(555)-555-5555"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          )}
        </form.AppField>
      </div>

      <div>
        <div className="border-b-2 border-kfk-blue w-full mb-8">
          <h2 className="text-xl font-bold text-kfk-blue pb-1">Address</h2>
        </div>

        <form.AppField
          name="streetAddress"
          validators={{
            onChange: validateWith(generalInfoSchema.shape.streetAddress),
          }}
        >
          {(field) => (
            <field.FormFieldInput
              Icon={MapPinIcon}
              disabled={disabled}
              label="Street Address"
              placeholder="10 Mountain View Way"
              autoComplete="street-address"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="addressLine2"
          validators={{
            onChange: validateWith(generalInfoSchema.shape.addressLine2),
          }}
        >
          {(field) => (
            <field.FormFieldInput
              Icon={MapPinIcon}
              disabled={disabled}
              label="Address Line 2"
              placeholder="Apt. J"
              autoComplete="address-line2"
            />
          )}
        </form.AppField>

        <form.AppField
          name="city"
          validators={{
            onChange: validateWith(generalInfoSchema.shape.city),
          }}
        >
          {(field) => (
            <field.FormFieldInput
              Icon={MapPinIcon}
              disabled={disabled}
              label="City"
              placeholder="Baltimore"
              autoComplete="address-level2"
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="state"
          validators={{
            onChange: validateWith(generalInfoSchema.shape.state),
          }}
        >
          {(field) => (
            <field.FormSelect
              label="State"
              disabled={disabled}
              placeholder="Select State"
              values={US_STATES}
              required
            />
          )}
        </form.AppField>

        <form.AppField
          name="zipCode"
          validators={{
            onChange: validateWith(generalInfoSchema.shape.zipCode),
          }}
        >
          {(field) => (
            <field.FormFieldInput
              Icon={MapPinIcon}
              disabled={disabled}
              label="Zipcode"
              placeholder="20742"
              inputMode="numeric"
              autoComplete="postal-code"
              required
            />
          )}
        </form.AppField>
      </div>
    </div>
  );
}
