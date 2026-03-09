import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import {
  ArrowRightCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GiftIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { useFormContext } from "@/components/providers/FormProvider";
import { childGiftSchema, giftsFormSchema } from "@/lib/formSchemas";
import { FormCheckbox, FormFieldInput } from "@/components/form/formcomponents";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormItem } from "@/components/ui/form";
import { FormProgressBar } from "@/components/form/FormProgressBar";
import { useProgressBarNavigation } from "@/hooks/form/FormHooks";
import LadyBug from "@/assets/form/ladybug.png";

export const Route = createFileRoute("/family/form/gift-details")({
  component: GiftsStep,
});

type GiftSelection = {
  giftUrl: string;
  giftName: string;
};

function GiftsStep() {
  const { updateSection, formState } = useFormContext();
  const navigate = useNavigate();
  const children = formState.children?.children || [];
  const siblings = formState.children?.hasSiblings
    ? formState.children?.siblings || []
    : [];
  const childrenNameList = [
    ...children.map((c) => c.name),
    ...siblings.map((s) => s.name),
  ];

  // -1: "Dashboard".
  // 0, 1, 2, 3, ...: Specific forms for that child
  const [activeChildIndex, setActiveChildIndex] = useState<number>(-1);

  const reconciledGiftSelections = childrenNameList.map((childName) => {
    const existing = formState.gifts?.giftSelections?.find(
      (g) => g.childName === childName,
    );
    if (existing) return existing;
    return {
      childName,
      gifts: [
        { giftName: "", giftUrl: "" },
        { giftName: "", giftUrl: "" },
        { giftName: "", giftUrl: "" },
      ] as [GiftSelection, GiftSelection, GiftSelection],
      backupGifts: [
        { giftName: "", giftUrl: "" },
        { giftName: "", giftUrl: "" },
      ] as [GiftSelection, GiftSelection],
      verified: false,
    };
  });

  const form = useForm({
    defaultValues: {
      giftSelections: reconciledGiftSelections,
    },
  });

  const handleProgressBarNavigate = useProgressBarNavigation(
    "gifts",
    () => form.state.values,
  );

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("gifts", currentValues);
    navigate({ to: "/family/form/children" });
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
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardDescription className="text-center">
            Fill all required fields to go to next step
            <span className="text-destructive">*</span>
          </CardDescription>
          <FormProgressBar onNavigate={handleProgressBarNavigate} />
        </CardHeader>
        <CardContent className="flex flex-col justify-center">
          <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
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
              <CardDescription className="text-green-900">
                To help us spread the love to as many children as possible,
                please follow these guidelines:
              </CardDescription>
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
                  <a href="https://amazon.com" className="underline">
                    Amazon.com
                  </a>{" "}
                  or{" "}
                  <a href="https://macys.com" className="underline">
                    Macy's.com
                  </a>
                </li>
              </ul>
            </div>
            <CardDescription className="font-bold text-center text-green-900">
              Thank you for helping us make this holiday special for every
              child!
            </CardDescription>
          </div>

          {childrenNameList.map((childName, index) => (
            <button
              key={index}
              className={`flex flex-row cursor-pointer justify-around ${isChildComplete(index) == "completed" ? "bg-[var(--color-kfk-green)]" : isChildComplete(index) == "dirty" ? "bg-red-500" : "bg-yellow-300"} ${isChildComplete(index) == "dirty" && "text-white"} rounded-lg text-md p-4 mx-7 mt-7`}
              onClick={() => setActiveChildIndex(index)}
            >
              <span className="my-auto">{childName}'s Gift Selection</span>
              {isChildComplete(index) == "completed" ? (
                <CheckCircleIcon className="size-12" />
              ) : isChildComplete(index) == "dirty" ? (
                <XCircleIcon className="size-12" />
              ) : (
                <ArrowRightCircleIcon className="size-12" />
              )}
            </button>
          ))}
          <FormItem className="flex gap-4 pt-4 mx-5 mt-5">
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
                  navigate({ to: "/family/form/review" });
                }
              }}
              size="lg"
              className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg"
            >
              Next
              <ChevronRightIcon className="ml-2 h-6 w-6" />
            </Button>
          </FormItem>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="flex flex-col justify-around gap-7">
          <CardTitle className="mx-auto text-2xl text-[var(--color-kfk-blue)] text-center">
            {childrenNameList[activeChildIndex]}'s Gift Selection
          </CardTitle>
          <CardDescription className="mx-auto">
            <em>Please choose up to 3 gifts for your child.</em>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-10">
            <div className="flex flex-col gap-7">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <CardDescription className="text-md text-[var(--color-kfk-blue)] -mb-2">
                    Gift #{i + 1}
                  </CardDescription>
                  <form.Field
                    name={`giftSelections[${activeChildIndex}].gifts[${i}].giftUrl`}
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "URL is required";

                        try {
                          const url = new URL(value);
                          if (!["http:", "https:"].includes(url.protocol)) {
                            return "URL must start with http or https";
                          }
                          return undefined;
                        } catch (e) {
                          return "Please enter a valid URL";
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <FormFieldInput
                        field={field}
                        Icon={GiftIcon}
                        label={`Gift #${i + 1} URL${i != 0 ? " (Optional)" : ""}`}
                        placeholder="e.g. amazon.com/Monopoly-Family-Board-Players"
                        required={i == 0}
                      />
                    )}
                  </form.Field>
                  <form.Field
                    name={`giftSelections[${activeChildIndex}].gifts[${i}].giftName`}
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Gift name is required";
                        if (value.length > 100) return "Gift name is too long";
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <FormFieldInput
                        field={field}
                        Icon={GiftIcon}
                        label={`Gift #${i + 1} Name${i != 0 ? " (Optional)" : ""}`}
                        placeholder="e.g. Monopoly"
                        required={i == 0}
                      />
                    )}
                  </form.Field>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-7">
              {[0, 1].map((i) => (
                <div key={i}>
                  <CardDescription className="text-md text-[var(--color-kfk-blue)] -mb-2">
                    Backup Gift #{i + 1}
                  </CardDescription>
                  <form.Field
                    name={`giftSelections[${activeChildIndex}].backupGifts[${i}].giftUrl`}
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "URL is required";

                        try {
                          const url = new URL(value);
                          if (!["http:", "https:"].includes(url.protocol)) {
                            return "URL must start with http or https";
                          }
                          return undefined;
                        } catch (e) {
                          return "Please enter a valid URL";
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <FormFieldInput
                        field={field}
                        Icon={GiftIcon}
                        label={`Backup Gift #${i + 1} URL`}
                        placeholder="e.g. amazon.com/Monopoly-Family-Board-Players"
                        required
                      />
                    )}
                  </form.Field>
                  <form.Field
                    name={`giftSelections[${activeChildIndex}].backupGifts[${i}].giftName`}
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return "Gift name is required";
                        if (value.length > 100) return "Gift name is too long";
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <FormFieldInput
                        field={field}
                        Icon={GiftIcon}
                        label={`Backup Gift #${i + 1} Name`}
                        placeholder="e.g. Monopoly"
                        required
                      />
                    )}
                  </form.Field>
                </div>
              ))}
            </div>

            <form.Field
              name={`giftSelections[${activeChildIndex}].verified` as any}
            >
              {(field) => (
                <FormCheckbox field={field}>
                  I verify that all selected gifts are $25 or under based on the
                  original price.
                </FormCheckbox>
              )}
            </form.Field>

            <Button
              type="button"
              onClick={() => setActiveChildIndex(-1)}
              variant="outline"
              className="flex h-14 rounded-xl border-2 border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] font-bold text-lg"
            >
              <ChevronLeftIcon className="mr-2 h-6 w-6" />
              Back
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
