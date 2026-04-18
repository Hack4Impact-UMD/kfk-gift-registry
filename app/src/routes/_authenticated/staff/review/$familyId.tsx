import { createFileRoute } from "@tanstack/react-router";
import type { Family } from "../../../../../../common/src/types/family";
import { GuardianInfoCard } from "@/components/review/GuardianInfoCard";
import * as React from "react";
import { ChildCard } from "@/components/review/ChildCard";
import type { Gift } from "common";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReviewActionPanel } from "@/components/review/ReviewActionPanel";
import { Child } from "common";
import { getFamilyById } from "@/server/functions/family";
import { useUpdateFamily } from "@/hooks/mutations/useUpdateFamily";
import { getChildProfilesForFamily } from "@/server/functions/child";
import { useUpdateChild } from "@/hooks/mutations/useUpdateChild";

export const Route = createFileRoute("/_authenticated/staff/review/$familyId")({
  loader: async ({ params }) => {
    // TODO: handle database fetching here
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

function RouteComponent() {
  // const params = Route.useParams();
  // const familyId = params.familyId;
  const { family, children, familyId } = Route.useLoaderData();
  const { mutate: updateFamily, isPending: isFamilyPending } =
    useUpdateFamily();
  const { mutate: updateChild, isPending: isChildPending } = useUpdateChild();

  const lastName = family?.contactName.trim().split(/\s+/).pop() ?? "";
  const [familyData, setFamilyData] = React.useState<Family>(family!);
  const [childrenData, setChildrenData] =
    React.useState<Array<Child>>(children);

  const handleFamilyUpdate = (updatedFamily: Family) => {
    // update database
    setFamilyData(updatedFamily);
    updateFamily({
      familyId: familyId,
      updates: updatedFamily,
    });
  };

  const handleChildUpdate = (updatedChild: Child) => {
    setChildrenData((prev) =>
      prev.map((c) => (c.id === updatedChild.id ? updatedChild : c)),
    );

    updateChild({
      childId: updatedChild.id,
      updates: {
        ...updatedChild,
        photoUrl: updatedChild.photoUrl || undefined,
      },
    });
  };

  return (
    <div className="flex h-full flex-col pb-10 pl-6 pr-6 pt-6 lg:pl-16 lg:pr-10">
      <h1 className="text-4xl font-bold">{lastName} Family</h1>
      <div className="mt-6 flex min-h-0 w-full flex-1 flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <section
          className="w-full max-w-3xl min-w-0 lg:self-stretch"
          aria-label="Family information"
        >
          <ScrollArea className="h-full min-h-[40rem] w-full rounded-md border p-9 shadow-xl">
            <div className="flex flex-col gap-7 pr-4">
              <GuardianInfoCard
                family={familyData}
                onSave={handleFamilyUpdate}
              />
              {childrenData.map((childData) => (
                <ChildCard
                  key={childData.id}
                  child={childData}
                  onSave={handleChildUpdate}
                />
              ))}
            </div>
          </ScrollArea>
        </section>
        <ReviewActionPanel familyId={familyId} />
      </div>
    </div>
  );
}
