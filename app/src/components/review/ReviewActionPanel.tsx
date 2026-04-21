import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { CheckCircleOutlineIcon } from "@/components/icons/CheckCircleOutlineIcon";
import { useUpdateFamilyReviewStatus } from "@/hooks/mutations/useUpdateFamilyReviewStatus";
import type { Family } from "common";
import { StatusBadge } from "@/components/tables/PendingProfilesTable/StatusBadge";
import type { ApplicationStatus } from "@/components/tables/PendingProfilesTable/types";

const CHECKLIST_ITEMS = [
  "No gift cards allowed",
  "Gifts should be $25 or under",
  "Gift links must point to Amazon/Macy's only",
  "Profile pictures must be appropriate",
  "Personal blurbs must be appropriate",
] as const;

const ADMIN_COMMENTS_PLACEHOLDER =
  "Add comments for staff reviewing this family.";

interface ReviewActionPanelProps {
  family: Family;
  onPreviousFamily?: () => void;
  onNextFamily?: () => void;
}

export function ReviewActionPanel({
  family,
  onPreviousFamily,
  onNextFamily,
}: ReviewActionPanelProps) {
  const { mutate: updateFamilyReviewStatus, isPending: isStatusPending } =
    useUpdateFamilyReviewStatus();

  const savedAdminComments = family.reviewStatus.held
    ? (family.reviewStatus.holdNotes ?? "")
    : (family.reviewStatus.reviewNotes ?? "");
  const [adminComments, setAdminComments] = useState(savedAdminComments);

  const familyStatus: ApplicationStatus = family.reviewStatus.approved
    ? "approved"
    : family.reviewStatus.held
      ? "holdfile"
      : "pending";
  const normalizedAdminComments = adminComments.trim();
  const hasUnsavedComments = adminComments !== savedAdminComments;

  const persistReviewUpdate = (
    reviewStatus: Family["reviewStatus"],
    options?: {
      onSuccess?: (updatedFamily: Family) => void;
    },
  ) => {
    updateFamilyReviewStatus(
      {
        familyId: family.id,
        updates: {
          reviewStatus: {
            approved: reviewStatus.approved,
            held: reviewStatus.held,
            reviewNotes: reviewStatus.held
              ? (family.reviewStatus.reviewNotes ?? "")
              : normalizedAdminComments,
            holdNotes: reviewStatus.held
              ? normalizedAdminComments
              : (family.reviewStatus.holdNotes ?? ""),
          },
        },
      },
      {
        onSuccess: (updatedFamily) => {
          options?.onSuccess?.(updatedFamily);
        },
      },
    );
  };

  const handleFamilyNavigation = (navigateToFamily?: () => void) => {
    if (!navigateToFamily || isStatusPending) {
      return;
    }

    if (hasUnsavedComments) {
      persistReviewUpdate(family.reviewStatus, {
        onSuccess: () => {
          navigateToFamily();
        },
      });
      return;
    }

    navigateToFamily();
  };

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80 xl:w-96">
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Family Status
          </h2>
          <StatusBadge status={familyStatus} className="text-sm" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold tracking-tight text-foreground">
          Approval Checklist
        </h2>
        <Card className="border bg-white py-4 shadow-md">
          <CardContent className="flex flex-col gap-3 px-4">
            {CHECKLIST_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircleOutlineIcon
                  className="mt-0.5 size-5 shrink-0 text-foreground"
                  aria-hidden
                />
                <span className="text-sm leading-snug text-foreground">
                  {item}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold tracking-tight text-foreground">
          Admin Comments
        </h2>
        <Card className="border bg-white py-4 shadow-md">
          <CardContent className="px-4">
            <Textarea
              value={adminComments}
              onChange={(event) => setAdminComments(event.target.value)}
              placeholder={ADMIN_COMMENTS_PLACEHOLDER}
              className="min-h-32 resize-none border-0 bg-white shadow-none text-sm text-foreground focus-visible:border-0 focus-visible:ring-0 md:text-sm"
            />
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isStatusPending || !hasUnsavedComments}
                onClick={() => {
                  persistReviewUpdate(family.reviewStatus);
                }}
              >
                Save Comments
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          disabled={isStatusPending || family.reviewStatus.approved}
          onClick={() => {
            persistReviewUpdate({
              ...family.reviewStatus,
              approved: true,
              held: false,
            });
          }}
          className="h-11 w-full rounded-md bg-green-600 text-base font-medium text-white hover:bg-green-700"
        >
          Move to Approved
        </Button>
        <Button
          type="button"
          disabled={isStatusPending || family.reviewStatus.held}
          onClick={() => {
            persistReviewUpdate({
              ...family.reviewStatus,
              approved: false,
              held: true,
            });
          }}
          className="h-11 w-full rounded-md bg-red-600 text-base font-medium text-white hover:bg-red-700"
        >
          Move to Holdfile
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="default"
          disabled={isStatusPending || !onPreviousFamily}
          onClick={() => {
            handleFamilyNavigation(onPreviousFamily);
          }}
          className="h-10 w-full rounded-md bg-kfk-blue text-white hover:bg-kfk-blue/90"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          Previous
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={isStatusPending || !onNextFamily}
          onClick={() => {
            handleFamilyNavigation(onNextFamily);
          }}
          className="h-10 w-full rounded-md bg-kfk-blue text-white hover:bg-kfk-blue/90"
        >
          Next
          <ArrowRightIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </aside>
  );
}
