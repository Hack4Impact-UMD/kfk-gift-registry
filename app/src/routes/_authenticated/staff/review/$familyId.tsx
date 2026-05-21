import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "@tanstack/react-db";
import { eq } from "@tanstack/react-db";
import { useCollections } from "@/collections/context";
import {
  childrenByFamilyIdQueryOptions,
  familyByIdQueryOptions,
} from "@/collections/preload";
import { GuardianInfoCard } from "@/components/review/GuardianInfoCard";
import { ChildCard } from "@/components/review/ChildCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReviewActionPanel } from "@/components/review/ReviewActionPanel";
import type { Child } from "common";
import { useDrive } from "@/context/DriveContext";
import { useReviewOrder } from "@/context/ReviewOrderContext";
import { usePendingProfileTableRows } from "@/hooks/queries/usePendingProfileTableRows";

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
  const navigate = useNavigate();
  const collections = useCollections();
  const { activeDriveId } = useDrive();
  const { reviewOrder } = useReviewOrder();
  const { data: familyRows } = usePendingProfileTableRows(activeDriveId);

  const { data: familyData = [] } = useLiveQuery((q) =>
    q
      .from({ f: collections.families })
      .where(({ f }) => eq(f.id, familyId)),
  );
  const family = familyData[0];

  const { data: children = [] } = useLiveQuery((q) =>
    q
      .from({ c: collections.children })
      .where(({ c }) => eq(c.familyId, familyId)),
  );

  if (!family) {
    throw new Error("Family not found");
  }

  const familyOrder = reviewOrder.includes(familyId)
    ? reviewOrder
    : (familyRows?.map((row) => row.id) ?? []);
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

  const sortedChildren = [...children].sort((a, b) => {
    const rank = (c: Child) => (c.category === "warrior" ? 0 : 1);
    return rank(a) - rank(b);
  });

  return (
    <div className="flex h-full flex-col p-4 ">
      <div className=" flex min-h-0 w-full flex-1 flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <section
          className="w-full max-w-3xl min-w-0 lg:self-stretch"
          aria-label="Family information"
        >
          <h1 className="text-4xl font-bold mb-2">{lastName}'s Family</h1>
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
