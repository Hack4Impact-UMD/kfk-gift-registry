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

const MOCK_GIFTS_JOHN: Array<Gift> = [
  {
    id: "gift-john-1",
    childId: "john-smith",
    familyId: "family123",
    giftDrive: "gd_seed_fall_2025_2",
    title: "Taco Cat Goat Cheese Pizza Card Game",
    productUrl: "https://example.com/taco-cat",
    listedPrice: 19.87,
    status: "AVAILABLE",
    createdAt: "2025-09-13T05:00:27.182Z",
    backup: false,
    active: true,
  },
  {
    id: "gift-john-2",
    childId: "john-smith",
    familyId: "family123",
    giftDrive: "gd_seed_fall_2025_2",
    title: "HUES and CUES - Color Guessing Board Game",
    productUrl: "https://example.com/hues",
    listedPrice: 19.87,
    status: "AVAILABLE",
    createdAt: "2025-09-13T05:00:27.182Z",
    backup: false,
    active: true,
  },
];

const MOCK_GIFTS_JANE: Array<Gift> = [
  {
    id: "gift-jane-1",
    childId: "jane-smith",
    familyId: "family123",
    giftDrive: "gd_seed_fall_2025_2",
    title: "Art Supply Kit - 64 Piece",
    productUrl: "https://example.com/art-kit",
    listedPrice: 24.99,
    status: "AVAILABLE",
    createdAt: "2025-09-13T05:00:27.182Z",
    backup: false,
    active: true,
  },
  {
    id: "gift-jane-2",
    childId: "jane-smith",
    familyId: "family123",
    giftDrive: "gd_seed_fall_2025_2",
    title: "Kids' Headphones (Wired)",
    productUrl: "https://example.com/headphones",
    listedPrice: 16.5,
    status: "AVAILABLE",
    createdAt: "2025-09-13T05:00:27.182Z",
    backup: false,
    active: true,
  },
];

const mockFamily: Family = {
  id: "family123",
  contactName: "Anna Smith",
  email: "AnnaSmith@gmail.com",
  phone: "123-456-7890",
  giftDrive: "gd_seed_fall_2025_2",
  createdAt: "2025-09-13T05:00:27.182Z",

  address: {
    street: "629 N Walnut Street",
    city: "Dellbury",
    state: "PA",
    zipCode: "10087",
  },

  reviewStatus: {
    approved: true,
    held: false,
    lastReviewedAt: "2025-10-19T19:53:02.455Z",
    reviewedBy: "director_1",
    reviewNotes: "Family information verified by staff intake.",
  },

  privateNotes:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis",
};

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
        <ReviewActionPanel />
      </div>
    </div>
  );
}
