import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GuardianInfoCard } from "@/components/review/GuardianInfoCard";
import { ChildCard } from "@/components/review/ChildCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReviewActionPanel } from "@/components/review/ReviewActionPanel";
import type { Child, Family } from "common";
import { useDrive } from "@/context/DriveContext";
import { useReviewOrder } from "@/context/ReviewOrderContext";
import { usePendingProfileTableRows } from "@/hooks/queries/usePendingProfileTableRows";
import { useFamily } from "@/hooks/queries/useFamily";
import { useChildProfilesForFamily } from "@/hooks/queries/useChildProfilesForFamily";
import { useUpdateFamily } from "@/hooks/mutations/useUpdateFamily";
import { useUpdateChild } from "@/hooks/mutations/useUpdateChild";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/_authenticated/staff/review/$familyId")({
  beforeLoad: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        queries.families.byId(params.familyId),
      ),
      context.queryClient.ensureQueryData(
        queries.children.byFamilyId(params.familyId),
      ),
    ]);
  },
  component: RouteComponent,
});

interface ChildCardWithGiftsProps {
  child: Child;
  onSave: (updatedChild: Child) => void;
}

function omitUndefined<T extends Record<string, unknown>>(
  value: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Partial<T>;
}

function ChildCardWithGifts({ child, onSave }: ChildCardWithGiftsProps) {
  const {
    data: fetchedGifts,
    isPending: isLoadingGifts,
    isError,
  } = useQuery(queries.children.gifts(child.id));

  if (isLoadingGifts) {
    return (
      <div className="w-full bg-muted border border-black rounded-lg min-h-32 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="text-kfk-red">
        Unable to load gifts for {child.name}.
      </div>
    );
  }

  return (
    <ChildCard child={child} fetchedGifts={fetchedGifts} onSave={onSave} />
  );
}

function RouteComponent() {
  const { familyId } = Route.useParams();
  const navigate = useNavigate();
  const { activeDriveId } = useDrive();
  const { reviewOrder } = useReviewOrder();
  const { data: familyRows } = usePendingProfileTableRows(activeDriveId);
  const { data: family } = useFamily(familyId);
  const { data: children } = useChildProfilesForFamily(familyId) as {
    data: Child[] | undefined;
  };
  const { mutate: updateFamily } = useUpdateFamily();
  const { mutate: updateChild } = useUpdateChild();

  if (!family || !children) {
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

  const handleFamilyUpdate = (updatedFamily: Family) => {
    updateFamily({
      familyId: familyId,
      updates: {
        contactName: updatedFamily.contactName,
        guardianRelationship: updatedFamily.guardianRelationship ?? "",
        email: updatedFamily.email,
        phone: updatedFamily.phone,
        privateNotes: updatedFamily.privateNotes ?? "",
      },
    });
  };

  const handleChildUpdate = (updatedChild: Child) => {
    const childUpdates = omitUndefined({
      diagnosisLengthYears: updatedChild.diagnosisLengthYears,
      diagnosis: updatedChild.diagnosis,
      age: updatedChild.age,
      treatmentLevel: updatedChild.treatmentLevel,
      publicBlurb: updatedChild.publicBlurb,
      childSocialWorker: updatedChild.childSocialWorker,
      hospital: updatedChild.hospital,
      photoUrl: updatedChild.photoUrl,
      staffPrivateNotes: updatedChild.staffPrivateNotes,
      offTreatmentDurationYears: updatedChild.offTreatmentDurationYears,
    });

    updateChild({
      childId: updatedChild.id,
      updates: childUpdates,
    });
  };

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
              <GuardianInfoCard family={family} onSave={handleFamilyUpdate} />
              {sortedChildren.map((childData) => (
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
