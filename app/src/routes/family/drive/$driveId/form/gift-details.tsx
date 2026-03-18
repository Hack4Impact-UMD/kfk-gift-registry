import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRightCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { useFormContext } from "@/components/providers/FormProvider";
import { childGiftSchema, giftsFormSchema } from "@/lib/formSchemas";
import { Button } from "@/components/ui/button";
import { FormItem } from "@/components/ui/form";
import { useGiftsForm } from "@/hooks/family-form/formHooks";
import { GiftDetailsForm } from "@/components/form/sections/GiftDetails";
import LadyBug from "@/assets/form/ladybug.png";

export const Route = createFileRoute(
  "/family/drive/$driveId/form/gift-details",
)({
  component: GiftsStep,
});

function GiftsStep() {
  const { updateSection, formState } = useFormContext();
  const navigate = useNavigate();
  const childrenNameList = (formState.children?.children || []).map(
    (c) => c.name,
  );
  const { driveId } = Route.useParams();

  // -1: "Dashboard".
  // 0, 1, 2, 3, ...: Specific forms for that child
  const [activeChildIndex, setActiveChildIndex] = useState<number>(-1);

  const form = useGiftsForm();

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("gifts", currentValues);
    navigate({
      to: "/family/drive/$driveId/form/children",
      params: { driveId },
    });
  };

  const isChildComplete = (
    index: number,
  ): "completed" | "pristine" | "dirty" => {
    const childData = form.state.values.giftSelections[index];
    const isComplete = childGiftSchema.safeParse(childData).success;

    if (isComplete) return "completed";

    const isPristine =
      childData.gifts.every((g) => g.giftName === "" && g.giftUrl === "") &&
      childData.verified === false;

    if (isPristine) return "pristine";

    return "dirty";
  };

  const allComplete = childrenNameList.every(
    (_, index) => isChildComplete(index) === "completed",
  );

  if (activeChildIndex === -1) {
    return (
      <div className="flex flex-col gap-8">
        <div className="border-b-2 border-[var(--color-kfk-blue)] w-full">
          <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">
            Gift Details
          </h2>
        </div>

        <div className="flex flex-col relative border bg-green-50 border-green-500 text-green-900 p-5 rounded-lg gap-4">
          <img
            src={LadyBug}
            className="w-8 object-cover absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <h2 className="text-center text-xl font-bold">Gift Guidelines</h2>
          <div className="flex flex-col gap-3">
            <p className="text-sm text-green-900">
              To help us spread the love to as many children as possible, please
              follow these guidelines:
            </p>
            <ul className="flex flex-col gap-2 list-disc px-7">
              <li>
                🎁 Gifts must be <strong>$25 or less</strong>, based on the{" "}
                <strong>original price</strong> (not the sale price).
              </li>
              <li>
                🚫 <strong>No gift cards</strong> are allowed.
              </li>
              <li>
                ✅ Gifts must be selected from{" "}
                <a
                  href="https://amazon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Amazon.com
                </a>{" "}
                or{" "}
                <a
                  href="https://macys.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Macy's.com
                </a>
              </li>
            </ul>
          </div>
          <p className="text-sm font-bold text-center text-green-900">
            Thank you for helping us make this holiday special for every child!
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {childrenNameList.map((childName, index) => (
            <button
              key={index}
              className={`flex flex-row cursor-pointer justify-around ${isChildComplete(index) === "completed" ? "bg-[var(--color-kfk-green)]" : isChildComplete(index) === "dirty" ? "bg-red-500" : "bg-yellow-300"} ${isChildComplete(index) === "dirty" && "text-white"} rounded-lg text-md p-4`}
              onClick={() => setActiveChildIndex(index)}
            >
              <span className="my-auto">{childName}'s Gift Selection</span>
              {isChildComplete(index) === "completed" ? (
                <CheckCircleIcon className="size-12" />
              ) : isChildComplete(index) === "dirty" ? (
                <XCircleIcon className="size-12" />
              ) : (
                <ArrowRightCircleIcon className="size-12" />
              )}
            </button>
          ))}
        </div>

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
            type="button"
            disabled={!allComplete}
            onClick={() => {
              const values = form.state.values;
              const result = giftsFormSchema.safeParse(values);
              if (result.success) {
                updateSection("gifts", result.data);
                navigate({
                  to: "/family/drive/$driveId/form/review",
                  params: { driveId },
                });
              }
            }}
            size="lg"
            className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg"
          >
            Next
            <ChevronRightIcon className="ml-2 h-6 w-6" />
          </Button>
        </FormItem>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-kfk-blue)] text-center mb-2">
          {childrenNameList[activeChildIndex]}'s Gift Selection
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          <em>Please choose up to 3 gifts for your child.</em>
        </p>
      </div>

      <GiftDetailsForm
        form={form}
        childIndex={activeChildIndex}
        childName={childrenNameList[activeChildIndex]}
      />

      <Button
        type="button"
        onClick={() => setActiveChildIndex(-1)}
        variant="outline"
        className="flex h-14 rounded-xl border-2 border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] font-bold text-lg"
      >
        <ChevronLeftIcon className="mr-2 h-6 w-6" />
        Back
      </Button>
    </div>
  );
}
