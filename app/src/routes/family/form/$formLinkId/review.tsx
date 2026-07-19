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
import { giftsFormSchema } from "@/lib/formSchemas";
import { GIFT_LISTING_URL_WARNING_MESSAGE } from "common";

export const Route = createFileRoute("/family/form/$formLinkId/review")({
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
      <h2 className="text-2xl font-bold text-[var(--color-kfk-blue)] pb-1">
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
  const { formState, resetForm } = useFormContext();
  const navigate = useNavigate();
  const { formLinkId } = Route.useParams();

  const submitMutation = useSubmitFamilyForm();

  const generalInfoForm = useGeneralInfoForm();
  const childrenFormHook = useChildrenForm();
  const giftsForm = useGiftsForm();

  const childrenNames = formState.children?.children.map((c) => c.name) ?? [];
  const giftValidationResult = formState.gifts
    ? giftsFormSchema.safeParse(formState.gifts)
    : null;
  const giftValidationIssues =
    giftValidationResult && !giftValidationResult.success
      ? giftValidationResult.error.issues
      : [];
  const blockingGiftValidationIssues = giftValidationIssues.filter(
    (issue) => issue.message !== GIFT_LISTING_URL_WARNING_MESSAGE,
  );
  const giftValidationError =
    blockingGiftValidationIssues[0]?.message ??
    giftValidationIssues[0]?.message ??
    null;
  const giftValidationErrorClassName =
    giftValidationError === GIFT_LISTING_URL_WARNING_MESSAGE
      ? "text-yellow-600"
      : "text-red-600";
  const submitDisabled =
    submitMutation.isPending ||
    !formState.generalInfo ||
    !formState.children ||
    !formState.gifts ||
    blockingGiftValidationIssues.length > 0;

  return (
    <div className="flex flex-col gap-10">
      {/* General Information */}
      <div>
        <SectionHeader
          title="General Information"
          onEdit={() =>
            navigate({
              to: "/family/form/$formLinkId/general-info",
              params: { formLinkId },
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
              to: "/family/form/$formLinkId/children",
              params: { formLinkId },
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
                to: "/family/form/$formLinkId/gift-details",
                params: { formLinkId },
                search: { childIndex: index },
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
        {giftValidationError && (
          <p className={`text-sm ${giftValidationErrorClassName}`}>
            {giftValidationError}
          </p>
        )}
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
          disabled={submitDisabled}
          className="flex-1 h-14 rounded-xl bg-kfk-blue text-white font-bold text-lg disabled:opacity-60"
          onClick={async () => {
            try {
              const payload = buildFamilyFormSubmitPayload(
                formLinkId,
                formState,
              );
              submitMutation.mutate(
                {
                  payload,
                  photos:
                    formState.children?.children.map((c) => c.photoUrl) ?? [],
                },
                {
                  onSuccess: (res) => {
                    resetForm();
                    navigate({
                      to: "/family/form/$formLinkId/thank-you",
                      params: { formLinkId },
                      search: {
                        linkId: res.link.id,
                      },
                    });
                  },
                },
              );
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
