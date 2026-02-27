import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useFormContext } from "@/components/providers/FormProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { consentSchema } from "@/lib/formSchemas";

export const Route = createFileRoute("/family/form/consent")({
  component: ConsentPageComponent,
});

function ConsentPageComponent() {
  const navigate = useNavigate();
  const { formState, updateSection } = useFormContext();

  const form = useForm({
    defaultValues: formState.consentScreen || {
      consentGiven: false,
      shareMailingAddress: false,
    },
    onSubmit: async ({ value }) => {
      const result = consentSchema.safeParse(value);
      if (!result.success) {
        const firstError = result.error.issues[0];
        alert(`Error: ${firstError.message}`);
        return;
      }

      updateSection("consentScreen", result.data);

      navigate({ to: "/family/form/general-info" });
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Consent Required</h1>
        
        <h2 
          className="text-2xl font-bold mb-3 sm:mb-4 text-center" 
          style={{ 
            fontFamily: 'Gaegu',
            lineHeight: '100%',
            letterSpacing: '0.5px'
          }}
        >
          Welcome to the Kisses for Kyle Holiday Gift Drive!
        </h2>

        <div className="space-y-4 mb-6 text-gray-700 text-sm sm:text-base text-left">
          <p>
            To participate in the Holiday Gift Drive, you must provide a mailing address for gift
            delivery. Your real address will be shared only with interested donors who are approved to
            view.
          </p>
          <p>
            If you prefer not to release your address, contact info@kissesforkyle.org for other gift
            options.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="consentGiven"
            children={(field) => (
              <div className="flex items-start gap-3 p-4 border rounded-lg text-left">
                <Checkbox
                  id="consent"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                  className="mt-0.5"
                />
                <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  By checking this box, I agree that Kisses for Kyle will share my home/mailing
                  address listed above with donors who are matched with my child's gift selections. I
                  understand that these gifts will be shipped directly to my home by the donor.
                </label>
              </div>
            )}
          />

          <form.Field
            name="shareMailingAddress"
            children={(field) => (
              <div className="flex items-start gap-3 text-left">
                <Checkbox
                  id="share-address"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                  className="mt-0.5"
                />
                <label htmlFor="share-address" className="text-sm cursor-pointer">
                  I agree to the sharing of my mailing address
                </label>
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full h-11 text-base bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold"
              >
                Agree And Continue
              </Button>
            )}
          />
        </form>
      </div>
    </div>
  );
}