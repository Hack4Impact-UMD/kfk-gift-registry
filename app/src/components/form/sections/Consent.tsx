import type { useConsentForm } from "@/hooks/family-form/formHooks";

type ConsentFormProps = {
  form: ReturnType<typeof useConsentForm>;
  disabled?: boolean;
};

export function ConsentForm({ form, disabled = false }: ConsentFormProps) {
  return (
    <>
      <form.AppField name="consentGiven">
        {(field) => (
          <field.FormAgreement
            checkboxLabel="I agree to the sharing of my mailing address"
            disabled={disabled}
          >
            By checking this box, I agree that Kisses for Kyle will share my
            home/mailing address listed above with donors who will be providing
            my child's holiday gift selections. I understand that these gifts
            will be shipped directly to my home by the donor
          </field.FormAgreement>
        )}
      </form.AppField>

      <form.AppField name="shareMailingAddress">
        {(field) => (
          <field.FormAgreement
            checkboxLabel="I certify my legal guardianship and residency"
            disabled={disabled}
          >
            By checking this box, I certify that I am the legal parent or
            court-appointed guardian of the child(ren) listed in this
            application and that the child(ren) currently reside in my
            household. I understand that confirmation of legal guardianship and
            residency is required to participate in the Kisses for Kyle Holiday
            Gift Drive, and I acknowledge that providing false information may
            result in removal from the program.
          </field.FormAgreement>
        )}
      </form.AppField>
    </>
  );
}
