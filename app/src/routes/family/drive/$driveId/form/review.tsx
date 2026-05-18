import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/components/providers/FormProvider";
import { FormItem } from "@/components/ui/form";
import {
  useChildrenForm,
  useGeneralInfoForm,
  useGiftsForm,
} from "@/hooks/family-form/formHooks";
import { GeneralInfoForm } from "@/components/form/sections/GeneralInfo";
import { ChildInfoForm } from "@/components/form/sections/ChildInfo";
import { GiftDetailsForm } from "@/components/form/sections/GiftDetails";
import {
  buildFamilyFormSubmitPayload,
  useSubmitFamilyForm,
} from "@/hooks/mutations/useSubmitFamilyForm";

export const Route = createFileRoute("/family/drive/$driveId/form/review")({
  head: () => ({
    meta: [
      { title: "Review Information - Family Registration" },
      {
        name: "description",
        content:
          "Review your family registration information before submitting",
      },
    ],
  }),
  component: RouteComponent,
});

type SectionHeaderProps = {
  title: string;
  onEdit: () => void;
};

function SectionHeader({ title, onEdit }: SectionHeaderProps) {
  return (
    <div className="flex justify-between border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
      <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">
        {title}
      </h2>
      <button
        type="button"
        onClick={onEdit}
        className="text-sm h-5 my-auto cursor-pointer transition duration-200 ease-in-out hover:bg-[var(--color-kfk-blue)] hover:text-white text-[var(--color-kfk-blue)] border border-[var(--color-kfk-blue)] px-4 rounded-md"
      >
        Edit
      </button>
    </div>
  );
}

function RouteComponent() {
  const { formState } = useFormContext();
  const navigate = useNavigate();
  const { driveId } = Route.useParams();

  const submitMutation = useSubmitFamilyForm();

  const generalInfoForm = useGeneralInfoForm();
  const childrenFormHook = useChildrenForm();
  const giftsForm = useGiftsForm();

  const childrenNames = formState.children?.children.map((c) => c.name) ?? [];

  return (
    <div className="flex flex-col gap-10">
      {/* General Information */}
      <div>
        <SectionHeader
          title="General Information"
          onEdit={() =>
            navigate({
              to: "/family/drive/$driveId/form/general-info",
              params: { driveId },
            })
          }
        />
        <GeneralInfoForm form={generalInfoForm} disabled />
      </div>

      {/* Child Information */}
      <div>
        <SectionHeader
          title="Child Information"
          onEdit={() =>
            navigate({
              to: "/family/drive/$driveId/form/children",
              params: { driveId },
            })
          }
        />
        <ChildInfoForm childForm={childrenFormHook} disabled />
      </div>

      {/* Gift Selections */}
      {childrenNames.map((childName, index) => (
        <div key={index}>
          <SectionHeader
            title={`${childName}'s Gift Selection`}
            onEdit={() =>
              navigate({
                to: "/family/drive/$driveId/form/gift-details",
                params: { driveId },
              })
            }
          />
          <GiftDetailsForm
            form={giftsForm}
            childIndex={index}
            childName={childName}
            disabled
          />
        </div>
      ))}

      <FormItem className="flex flex-col gap-2 pt-4 mt-6">
        {submitMutation.isError && (
          <p className="text-sm text-red-600">
            {submitMutation.error instanceof Error
              ? submitMutation.error.message
              : String(submitMutation.error)}
          </p>
        )}
        <Button
          type="button"
          size="lg"
          disabled={submitMutation.isPending}
          className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg disabled:opacity-60"
          onClick={async () => {
            try {
              const payload = await buildFamilyFormSubmitPayload(
                driveId,
                formState,
              );
              submitMutation.mutate(payload, {
                onSuccess: (link) =>
                  navigate({
                    to: "/family/drive/$driveId/form/thank-you",
                    params: { driveId },
                    search: {
                      linkId: link.id,
                    },
                  }),
              });
            } catch (e) {
              alert(e instanceof Error ? e.message : String(e));
            }
          }}
        >
          {submitMutation.isPending ? "Submitting…" : "Submit!"}
        </Button>
      </FormItem>
    </div>
  );
}
