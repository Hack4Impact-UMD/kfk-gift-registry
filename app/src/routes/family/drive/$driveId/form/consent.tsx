import { createFileRoute } from "@tanstack/react-router";
import { useConsentForm } from "@/hooks/form/FormHooks";
import { FormButton } from "@/components/form/FormComponents";
import { FieldGroup } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import KFKLogo from "@/assets/kisses-for-kyle-logo.png";

export const Route = createFileRoute("/family/drive/$driveId/form/consent")({
  component: ConsentPageComponent,
});

function ConsentPageComponent() {
  const form = useConsentForm();

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <img src={KFKLogo} className="w-50 m-auto" alt="Kisses for Kyle Logo" />
        <CardTitle className="font-bold text-[var(--color-kfk-red)] text-2xl text-center my-5">
          Welcome to our Annual Holiday Gift Drive!
        </CardTitle>
        <CardDescription>
          To participate in the Holiday Gift Drive, you must provide a mailing
          address for gift delivery. Your address will be shared only with
          interested donors who are approved to give.
        </CardDescription>
        <CardDescription>
          If you prefer not to release your address, contact{" "}
          <a className="underline" href="mailto:info@kissesforkyle.org">
            info@kissesforkyle.org
          </a>{" "}
          for other gift options.
        </CardDescription>
      </CardHeader>

      {/* Form content */}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent>
          <FieldGroup>
            {/* First checkbox - Address sharing consent */}
            <form.AppField name="consentGiven">
              {(field) => (
                <field.FormAgreement checkboxLabel="I agree to the sharing of my mailing address">
                  By checking this box, I agree that Kisses for Kyle will share
                  my home/mailing address listed above with donors who will be
                  providing my child's holiday gift selections. I understand
                  that these gifts will be shipped directly to my home by the
                  donor
                </field.FormAgreement>
              )}
            </form.AppField>

            {/* Second checkbox - Legal guardian certification */}
            <form.AppField name="shareMailingAddress">
              {(field) => (
                <field.FormAgreement checkboxLabel="I certify my legal guardianship and residency">
                  By checking this box, I certify that I am the legal parent or
                  court-appointed guardian of the child(ren) listed in this
                  application and that the child(ren) currently reside in my
                  household. I understand that confirmation of legal
                  guardianship and residency is required to participate in the
                  Kisses for Kyle Holiday Gift Drive, and I acknowledge that
                  providing false information may result in removal from the
                  program.
                </field.FormAgreement>
              )}
            </form.AppField>
          </FieldGroup>
        </CardContent>

        {/* Submit button */}
        <CardFooter>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <FormButton
                label="Agree and Continue"
                disabled={!canSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          />
        </CardFooter>
      </form>
    </Card>
  );
}
