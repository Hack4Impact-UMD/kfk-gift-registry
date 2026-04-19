import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { Family } from "../../../../../../common/src/types/family";
import { GuardianInfoCard } from "@/components/review/GuardianInfoCard";
import * as React from "react";
import { ChildCard } from "@/components/review/ChildCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReviewActionPanel } from "@/components/review/ReviewActionPanel";
import type { Child } from "common";
import { useDrive } from "@/context/DriveContext";
import { useReviewOrder } from "@/context/ReviewOrderContext";
import { usePendingProfileTableRows } from "@/hooks/queries/usePendingProfileTableRows";
import { getFamilyById } from "@/server/functions/family";
import { useUpdateFamily } from "@/hooks/mutations/useUpdateFamily";
import { getChildProfilesForFamily } from "@/server/functions/child";
import { useUpdateChild } from "@/hooks/mutations/useUpdateChild";
import { useQuery } from "@tanstack/react-query";
import { childQueries } from "@/queries/child";

export const Route = createFileRoute("/_authenticated/staff/review/$familyId")({
  loader: async ({ params }) => {
    const familyData = await getFamilyById({
      data: { familyId: params.familyId },
    });

    const chilrenData = await getChildProfilesForFamily({
      data: { familyId: params.familyId },
    });

    return {
      family: familyData,
      children: chilrenData,
      familyId: params.familyId,
    };
  },
  component: RouteComponent,
});

interface ChildCardWithGiftsProps {
  child: Child;
  onSave: (updatedChild: Child) => void;
}

function ChildCardWithGifts({ child, onSave }: ChildCardWithGiftsProps) {
  const { data: fetchedGifts, isPending: isLoadingGifts } = useQuery(
    childQueries.gifts(child.id),
  );

  if (isLoadingGifts) {
    return <div>Loading Child...</div>;
  }

  return (
    <ChildCard child={child} fetchedGifts={fetchedGifts} onSave={onSave} />
  );
}

function RouteComponent() {
  const { family, children, familyId } = Route.useLoaderData();
  const navigate = useNavigate();
  const { activeDriveId } = useDrive();
  const { reviewOrder } = useReviewOrder();
  const { data: familyRows } = usePendingProfileTableRows(activeDriveId);
  const { mutate: updateFamily } = useUpdateFamily();
  const { mutate: updateChild } = useUpdateChild();

  if (!family) {
    throw new Error("Family not found");
  }

  const [familyData, setFamilyData] = React.useState<Family>(family);
  const [childrenData, setChildrenData] =
    React.useState<Array<Child>>(children);

  React.useEffect(() => {
    setFamilyData(family);
    setChildrenData(children);
  }, [family, children, familyId]);

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

  const lastName = familyData.contactName.trim().split(/\s+/).pop() ?? "";
  const handleFamilyUpdate = (updatedFamily: Family) => {
    updateFamily(
      {
        familyId: familyId,
        updates: updatedFamily,
      },
      {
        onSuccess: () => setFamilyData(updatedFamily),
      },
    );
  };

  const handleChildUpdate = (updatedChild: Child) => {
    updateChild(
      {
        childId: updatedChild.id,
        updates: {
          ...updatedChild,
          photoUrl: updatedChild.photoUrl || undefined,
        },
      },
      {
        onSuccess: () => {
          setChildrenData((prev) =>
            prev.map((c) => (c.id === updatedChild.id ? updatedChild : c)),
          );
        },
      },
    );
  };

  const handleFamilyNavigation = (targetFamilyId: string) => {
    navigate({
      to: "/staff/review/$familyId",
      params: { familyId: targetFamilyId },
      search: (prev) => prev,
    });
  };

  return (
    <div className="flex h-full flex-col pb-10 pl-6 pr-6 pt-6 lg:pl-16 lg:pr-10">
      <h1 className="text-4xl font-bold">{lastName}'s Family</h1>
      <div className="mt-6 flex min-h-0 w-full flex-1 flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <section
          className="w-full max-w-3xl min-w-0 lg:self-stretch"
          aria-label="Family information"
        >
          <ScrollArea className="h-full min-h-[40rem] w-full rounded-md border p-9 shadow-xl">
            <div className="flex flex-col gap-7 pr-4">
              <GuardianInfoCard
                key={familyId}
                family={familyData}
                onSave={handleFamilyUpdate}
              />
              {childrenData.map((childData) => (
                <ChildCardWithGifts
                  key={childData.id}
                  child={childData}
                  onSave={handleChildUpdate}
                />
              ))}
            </div>
          </ScrollArea>
        </section>
        <ReviewActionPanel
          family={familyData}
          onFamilyReviewUpdated={setFamilyData}
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
