import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import type { useGeneralInfoForm } from "@/hooks/family-form/formHooks";
import { US_STATES } from "@/lib/formSchemas";
import {
  checkFamilyEmailAvailability,
  DUPLICATE_FAMILY_EMAIL_MESSAGE,
} from "@/server/functions/familyForm";

type GeneralInfoFormProps = {
  disabled?: boolean;
  form: ReturnType<typeof useGeneralInfoForm>;
};

async function validateUniqueFamilyEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return undefined;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return undefined;
  }

  try {
    await checkFamilyEmailAvailability({
      data: { email: normalizedEmail },
    });
    return undefined;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === DUPLICATE_FAMILY_EMAIL_MESSAGE
    ) {
      return DUPLICATE_FAMILY_EMAIL_MESSAGE;
    }
    return "We couldn't verify this email right now. Please try again.";
  }
}

export function GeneralInfoForm({
  form,
  disabled = false,
}: GeneralInfoFormProps) {
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
              const normalizedValue = value.trim().toLowerCase();
              if (!normalizedValue) return "Email is required";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue))
                return "Please enter a valid email address";
              return undefined;
            },
            onChangeAsyncDebounceMs: 400,
            onChangeAsync: async ({ value }) =>
              validateUniqueFamilyEmail(value),
            onSubmitAsync: async ({ value }) =>
              validateUniqueFamilyEmail(value),
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
              const normalizedValue = value.trim().toLowerCase();
              const normalizedEmail = fieldApi.form
                .getFieldValue("email")
                .trim()
                .toLowerCase();
              if (!normalizedValue) return "Please confirm your email";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue))
                return "Please enter a valid email address";
              if (normalizedValue !== normalizedEmail)
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
            onChange: ({ value }) => {
              if (!value || value === "") return "Phone number required";
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
            onChange: ({ value }) => (!value ? "State is required" : undefined),
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
