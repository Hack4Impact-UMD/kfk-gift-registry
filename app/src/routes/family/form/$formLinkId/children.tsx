import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "@/components/providers/FormProvider";
import { Button } from "@/components/ui/button";
import { useChildrenForm } from "@/hooks/family-form/formHooks";
import { ChildInfoForm } from "@/components/form/sections/ChildInfo";
import { FormItem } from "@/components/ui/form";

export const Route = createFileRoute("/family/form/$formLinkId/children")({
  head: () => ({
    meta: [
      { title: "Children Information - Registration" },
      {
        name: "description",
        content: "Add children information for the gift drive",
      },
    ],
  }),
  component: ChildrenPageComponent,
});

function ChildrenPageComponent() {
  const { updateSection } = useFormContext();
  const navigate = useNavigate();
  const { formLinkId } = Route.useParams();

  const { form, handleNext } = useChildrenForm();

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("children", currentValues);
    navigate({
      to: "/family/form/$formLinkId/general-info",
      params: {
        formLinkId,
      },
    });
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleNext();
      }}
      className="flex flex-col gap-10"
    >
      <ChildInfoForm childForm={{ form, handleNext }} />

      <FormItem className="flex gap-4 pt-4">
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
      </FormItem>
    </form>
  );
}
