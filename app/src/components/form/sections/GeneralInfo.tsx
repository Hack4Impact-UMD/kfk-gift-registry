import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import type { useGeneralInfoForm } from "@/hooks/form/FormHooks";
import { US_STATES } from "@/lib/formSchemas";

type GeneralInfoFormProps = {
  disabled?: boolean;
  form: ReturnType<typeof useGeneralInfoForm>;
};

export function GeneralInfoForm({ form, disabled = false }: GeneralInfoFormProps) {
  return (
    <>
      <div>
        <div className="border-b-2 border-kfk-blue w-full mb-8">
          <h2 className="text-xl font-bold text-kfk-blue pb-1">
            Family Contact Information
          </h2>
        </div>

        <form.AppField
          name="parentName"
          validators={{
            onChange: ({ value }) =>
              !value
                ? "Parent/Guardian name is required"
                : value.length > 100
                  ? "Name is too long"
                  : undefined,
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
            onChange: ({ value }) => {
              if (!value) return "Email is required";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                return "Please enter a valid email address";
              return undefined;
            },
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
              if (!value) return "Please confirm your email";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                return "Please enter a valid email address";
              const email = fieldApi.form.getFieldValue("email");
              if (value !== email) return "Emails do not match";
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
            onChange: ({ value }) => {
              if (!value || value === "") return undefined;
              if (!/^[\d\s\-()]+$/.test(value))
                return "Please enter a valid phone number";
              return undefined;
            },
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
            />
          )}
        </form.AppField>

        <form.AppField
          name="phoneNumberConfirm"
          validators={{
            onChangeListenTo: ["phoneNumber"],
            onChange: ({ value, fieldApi }) => {
              if (!value || value === "") return undefined;
              if (!/^[\d\s\-()]+$/.test(value))
                return "Please enter a valid phone number";
              const phoneNumber = fieldApi.form.getFieldValue("phoneNumber");
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
            onChange: ({ value }) =>
              !value
                ? "Street address is required"
                : value.length > 200
                  ? "Address is too long"
                  : undefined,
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
            onChange: ({ value }) =>
              value && value.length > 200 ? "Address is too long" : undefined,
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
            onChange: ({ value }) =>
              !value
                ? "City is required"
                : value.length > 100
                  ? "City name is too long"
                  : undefined,
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
            onChange: ({ value }) =>
              !value ? "State is required" : undefined,
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
            onChange: ({ value }) => {
              if (!value) return "Zip code is required";
              if (!/^\d{5}(-\d{4})?$/.test(value))
                return "Please enter a valid zip code (e.g., 12345 or 12345-6789)";
              return undefined;
            },
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
    </>
  );
}
