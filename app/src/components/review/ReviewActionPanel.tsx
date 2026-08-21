import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { CheckCircleOutlineIcon } from "@/components/icons/CheckCircleOutlineIcon";
import { useCollections } from "@/collections/context";
import type { Family } from "common";
import { StatusBadge } from "@/components/tables/PendingProfilesTable/StatusBadge";
import type { ApplicationStatus } from "@/components/tables/PendingProfilesTable/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { publishFamilies } from "@/server/functions/family";
import { toast } from "@/lib/toast";
import { DateTime } from "luxon";
import type { AuthUser } from "@/server/functions/auth";

const CHECKLIST_ITEMS = [
  "No gift cards allowed",
  "Gifts should be $30 or under",
  "Gift links must point to Amazon/Macy's only",
  "Profile pictures must be appropriate",
  "Personal blurbs must be appropriate",
  "Double-check each child's Level (A-D)",
] as const;

const ADMIN_COMMENTS_PLACEHOLDER =
  "Add comments for staff reviewing this family.";

interface ReviewActionPanelProps {
  family: Family;
  authUser: AuthUser;
  onPreviousFamily?: () => void;
  onNextFamily?: () => void;
}

export function ReviewActionPanel({
  family,
  authUser,
  onPreviousFamily,
  onNextFamily,
}: ReviewActionPanelProps) {
  const collections = useCollections();
  const [isPending, startStatusTransition] = useTransition();
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

  const runReviewUpdate = (
    nextStatus: Family["reviewStatus"],
    publish: boolean = false,
    onComplete?: () => void,
  ) => {
    startStatusTransition(async () => {
      try {
        const familiesTx = collections.families.update(family.id, (draft) => {
          draft.reviewStatus.approved = nextStatus.approved;
          draft.reviewStatus.held = nextStatus.held;

          if (nextStatus.lastReviewedAt !== undefined) {
            draft.reviewStatus.lastReviewedAt = nextStatus.lastReviewedAt;
          }
          if (nextStatus.reviewedBy !== undefined) {
            draft.reviewStatus.reviewedBy = nextStatus.reviewedBy;
          }
          if (nextStatus.held) {
            draft.reviewStatus.reviewNotes =
              family.reviewStatus.reviewNotes ?? "";
            draft.reviewStatus.holdNotes = normalizedAdminComments;
          } else {
            draft.reviewStatus.reviewNotes = normalizedAdminComments;
            draft.reviewStatus.holdNotes = family.reviewStatus.holdNotes ?? "";
          }
        });
        await familiesTx.isPersisted.promise;
        toast.success("Saved");
        if (publish) {
          await publishFamilies({ data: [family.id] });
          await collections.children.utils.refetch();
        }
        onComplete?.();
      } catch {
        // toast handled by collection onUpdate handler
      }
    });
  };

  const handleFamilyNavigation = (navigateToFamily?: () => void) => {
    if (!navigateToFamily || isPending) return;

    if (hasUnsavedComments) {
      runReviewUpdate(family.reviewStatus, false, navigateToFamily);
    } else {
      navigateToFamily();
    }
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
                disabled={isPending || !hasUnsavedComments}
                onClick={() => runReviewUpdate(family.reviewStatus)}
              >
                Save Comments
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <Button
            type="button"
            disabled={isPending || family.reviewStatus.approved}
            onClick={() =>
              runReviewUpdate(
                {
                  ...family.reviewStatus,
                  approved: true,
                  held: false,
                  lastReviewedAt: DateTime.now().toISO(),
                  reviewedBy: authUser.uid,
                },
                true,
              )
            }
            className="h-11 grow rounded-r-none rounded-l-md bg-green-600 text-base font-medium text-white hover:bg-green-700"
          >
            Approve and Publish
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isPending || family.reviewStatus.approved}
                className={
                  "rounded-l-none border-l-2 rounded-r-md h-11 px-2 bg-green-600 text-base font-medium text-white hover:bg-green-700"
                }
              >
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top">
              <DropdownMenuItem
                onClick={() => {
                  runReviewUpdate({
                    ...family.reviewStatus,
                    approved: true,
                    held: false,
                    lastReviewedAt: DateTime.now().toISO(),
                    reviewedBy: authUser.uid,
                  });
                }}
              >
                Approve without publishing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          type="button"
          disabled={isPending || family.reviewStatus.held}
          onClick={() =>
            runReviewUpdate({
              ...family.reviewStatus,
              approved: false,
              held: true,
              lastReviewedAt: DateTime.now().toISO(),
              reviewedBy: authUser.uid,
            })
          }
          className="h-11 w-full rounded-md bg-red-600 text-base font-medium text-white hover:bg-red-700"
        >
          Move to Holdfile
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="default"
          disabled={isPending || !onPreviousFamily}
          onClick={() => handleFamilyNavigation(onPreviousFamily)}
          className="h-10 w-full rounded-md bg-kfk-blue text-white hover:bg-kfk-blue/90"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          Previous
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={isPending || !onNextFamily}
          onClick={() => handleFamilyNavigation(onNextFamily)}
          className="h-10 w-full rounded-md bg-kfk-blue text-white hover:bg-kfk-blue/90"
        >
          Next
          <ArrowRightIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </aside>
  );
}
