import { createFileRoute } from "@tanstack/react-router";
import { useConsentForm } from "@/hooks/form/FormHooks";
import { FormButton } from "@/components/form/FormComponents";
import { FieldGroup } from "@/components/ui/field";
import KFKLogo from "@/assets/kisses-for-kyle-logo.png";
import { ConsentForm } from "@/components/form/sections/Consent";

export const Route = createFileRoute("/family/drive/$driveId/form/consent")({
  component: ConsentPageComponent,
});

function ConsentPageComponent() {
  const form = useConsentForm();

  return (
    <div>
      <div className="mb-6 text-center">
        <img src={KFKLogo} className="w-50 mx-auto mb-4" alt="Kisses for Kyle Logo" />
        <h1 className="font-bold text-[var(--color-kfk-red)] text-2xl mb-4">
          Welcome to our Annual Holiday Gift Drive!
        </h1>
        <p className="text-sm text-muted-foreground mb-2">
          To participate in the Holiday Gift Drive, you must provide a mailing
          address for gift delivery. Your address will be shared only with
          interested donors who are approved to give.
        </p>
        <p className="text-sm text-muted-foreground">
          If you prefer not to release your address, contact{" "}
          <a className="underline" href="mailto:info@kissesforkyle.org">
            info@kissesforkyle.org
          </a>{" "}
          for other gift options.
        </p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <FieldGroup>
          <ConsentForm form={form} />
        </FieldGroup>

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
      </form>
    </div>
  );
}
