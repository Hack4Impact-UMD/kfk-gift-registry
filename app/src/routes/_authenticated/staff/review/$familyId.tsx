import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useCollections } from "@/collections/context";
import {
  childrenByFamilyIdQueryOptions,
  familyByIdQueryOptions,
} from "@/collections/preload";
import { GuardianInfoCard } from "@/components/review/GuardianInfoCard";
import { ChildCard } from "@/components/review/ChildCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReviewActionPanel } from "@/components/review/ReviewActionPanel";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon";
import type { Child } from "common";
import { useDrive } from "@/context/DriveContext";
import { useReviewOrder } from "@/context/ReviewOrderContext";
import { usePendingProfileTableRows } from "@/hooks/queries/usePendingProfileTableRows";
import type { ApplicationStatus } from "@/components/tables/PendingProfilesTable/types";

const FILTER_LABELS: Record<ApplicationStatus | "all", string> = {
  all: "All Profiles",
  pending: "Pending Review",
  approved: "Approved",
  holdfile: "Hold Files",
};

export const Route = createFileRoute("/_authenticated/staff/review/$familyId")({
  beforeLoad: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        familyByIdQueryOptions(params.familyId),
      ),
      context.queryClient.ensureQueryData(
        childrenByFamilyIdQueryOptions(params.familyId),
      ),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Family Review - Staff" },
      {
        name: "description",
        content: "Review and process family application",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { familyId } = Route.useParams();
  const { auth } = Route.useRouteContext();
  const navigate = useNavigate();
  const collections = useCollections();
  const { activeDriveId } = useDrive();
  const { reviewOrder, activeFilter } = useReviewOrder();
  const { data: familyRows } = usePendingProfileTableRows(activeDriveId);

  const {
    data: familyData = [],
    isLoading: familyLoading,
    isError: familyIsError,
  } = useLiveQuery(
    (q) =>
      q.from({ f: collections.families }).where(({ f }) => eq(f.id, familyId)),
    [familyId],
  );
  const family = familyData[0];

  const {
    data: children = [],
    isLoading: childrenLoading,
    isError: childrenIsError,
  } = useLiveQuery(
    (q) =>
      q
        .from({ c: collections.children })
        .where(({ c }) => eq(c.familyId, familyId)),
    [familyId],
  );

  if (familyIsError || childrenIsError) {
    return (
      <div role="alert" className="p-4 text-kfk-red">
        Failed to load family for review.
      </div>
    );
  }

  if (familyLoading || childrenLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-muted-foreground">
        <Spinner />
        <span>Loading family...</span>
      </div>
    );
  }

  if (!family) {
    return (
      <div role="alert" className="p-4 text-kfk-red">
        Family not found.
      </div>
    );
  }

  const eligibleFamilyIds =
    familyRows
      ?.filter(
        (row) =>
          !activeFilter || row.status === activeFilter || row.id === familyId,
      )
      .map((row) => row.id) ?? [];
  const familyOrder = reviewOrder.includes(familyId)
    ? reviewOrder.filter((id) => eligibleFamilyIds.includes(id))
    : eligibleFamilyIds;
  const currentFamilyIndex = familyOrder.findIndex((id) => id === familyId);
  const previousFamilyId =
    currentFamilyIndex > 0 ? familyOrder[currentFamilyIndex - 1] : undefined;
  const nextFamilyId =
    currentFamilyIndex >= 0 && currentFamilyIndex < familyOrder.length - 1
      ? familyOrder[currentFamilyIndex + 1]
      : undefined;

  const lastName = family.contactName.trim().split(/\s+/).pop() ?? "";

  const handleFamilyNavigation = (targetFamilyId: string) => {
    navigate({
      to: "/staff/review/$familyId",
      params: { familyId: targetFamilyId },
      search: (prev) => prev,
    });
  };

  const handleBackToList = () => {
    navigate({ to: "/staff/family-approval", search: (prev) => prev });
  };

  const backLabel = FILTER_LABELS[activeFilter ?? "all"];

  const sortedChildren = [...children].sort((a, b) => {
    const rank = (c: Child) => (c.category === "warrior" ? 0 : 1);
    return rank(a) - rank(b);
  });

  return (
    <div className="flex h-full flex-col p-4 ">
      <div className="flex min-h-0 w-full flex-1 flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <section
          className="w-full max-w-3xl min-w-0 lg:self-stretch"
          aria-label="Family information"
        >
          <Button
            type="button"
            variant="default"
            onClick={handleBackToList}
            className="mb-4 h-10 rounded-md bg-kfk-blue text-white hover:bg-kfk-blue/90"
          >
            <ArrowLeftIcon className="size-4" aria-hidden />
            Back to {backLabel}
          </Button>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-4xl font-bold">{lastName}'s Family</h1>
            <span className="rounded-xl bg-muted px-4 py-2 text-2xl font-semibold text-foreground">
              {sortedChildren.length}{" "}
              {sortedChildren.length === 1 ? "child" : "children"}
            </span>
          </div>
          <ScrollArea className="h-full min-h-[40rem] w-full rounded-md border p-4 shadow-xl">
            <div className="flex flex-col gap-7 pr-4">
              <GuardianInfoCard family={family} />
              {sortedChildren.map((childData) => (
                <ChildCard key={childData.id} child={childData} />
              ))}
            </div>
          </ScrollArea>
        </section>
        <ReviewActionPanel
          key={family.id}
          family={family}
          authUser={auth.authUser}
          onPreviousFamily={
            previousFamilyId
              ? () => handleFamilyNavigation(previousFamilyId)
              : undefined
          }
          onNextFamily={
            nextFamilyId
              ? () => handleFamilyNavigation(nextFamilyId)
              : undefined
          }
        />
      </div>
    </div>
  );
}
