import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { useFormContext } from "@/components/providers/FormProvider";
import { FormItem } from "@/components/ui/form";
import { useGeneralInfoForm } from "@/hooks/form/FormHooks";
import { GeneralInfoForm } from "@/components/form/sections/GeneralInfo";

export const Route = createFileRoute(
  "/family/drive/$driveId/form/general-info",
)({
  component: GeneralRouteComponent,
});

function GeneralRouteComponent() {
  const { updateSection } = useFormContext();
  const navigate = useNavigate();
  const { driveId } = Route.useParams();
  const form = useGeneralInfoForm();

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("generalInfo", currentValues);
    navigate({
      to: "/family/drive/$driveId/form/consent",
      params: {
        driveId,
      },
    });
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-10"
    >
      <GeneralInfoForm form={form} />

      <FormItem className="flex gap-4 pt-4 mx-5">
        <Button
          type="button"
          onClick={handleBack}
          variant="outline"
          className="flex-1 h-14 rounded-xl border-2 border-kfk-blue text-kfk-blue font-bold text-lg"
        >
          <ChevronLeftIcon className="mr-2 h-6 w-6" />
          Back
        </Button>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              size="lg"
              className="flex-1 h-14 rounded-xl bg-kfk-blue text-white font-bold text-lg"
            >
              {isSubmitting ? "..." : "Next"}
              <ChevronRightIcon className="ml-2 h-6 w-6" />
            </Button>
          )}
        />
      </FormItem>
    </form>
  );
}
