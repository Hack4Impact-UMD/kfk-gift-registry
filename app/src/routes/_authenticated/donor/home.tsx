import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import DefaultProfile from "@/assets/default-profile-photo.png";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { useDonorCommittedChildren } from "@/hooks/queries/useDonorCommittedChildren";
import { queries } from "@/queries";
import { WelcomeBanner } from "@/components/donor/home/WelcomeBanner";
import { CommitmentCard } from "@/components/donor/home/CommitmentCard";
import { DonorChildDetailScreen } from "@/components/donor/home/DonorChildDetailScreen";

export const Route = createFileRoute("/_authenticated/donor/home")({
  validateSearch: z.object({
    childId: z.string().optional(),
  }),
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      queries.donor.home(context.currentDrive?.id ?? ""),
    );
  },
  head: () => ({
    meta: [
      { title: "Dashboard - Donor" },
      {
        name: "description",
        content: "View your committed gifts and manage your donations",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { auth, currentDrive } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const { childId } = Route.useSearch();
  const {
    data: committedChildren,
    isPending,
    isError,
  } = useDonorCommittedChildren(currentDrive?.id ?? "");

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Spinner />
      </div>
    );
  }

  const displayName = auth.authUser.displayName ?? "Unnamed User";

  if (isError) {
    return (
      <div className="bg-[#F5F7FB] px-4 py-6">
        <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6 md:max-w-3xl">
          <WelcomeBanner displayName={displayName} />
          <Card className="rounded-[24px] border border-[#E5E7EB] p-8 text-center text-[#4B5563] shadow-sm">
            Unable to load your committed gifts. Please try again.
          </Card>
        </div>
      </div>
    );
  }

  const childrenWithFallbackPhotos = (committedChildren ?? []).map((child) => ({
    ...child,
    photoUrl: child.photoUrl || DefaultProfile,
  }));

  const selectedChild =
    childrenWithFallbackPhotos.find((child) => child.id === childId) ?? null;

  if (selectedChild) {
    const selectedIndex = childrenWithFallbackPhotos.findIndex(
      (child) => child.id === selectedChild.id,
    );

    return (
      <DonorChildDetailScreen
        key={selectedChild.id}
        child={selectedChild}
        childIndex={selectedIndex}
        totalChildren={childrenWithFallbackPhotos.length}
        onBack={() =>
          navigate({
            to: "/donor/home",
            search: { childId: undefined },
          })
        }
        onNavigateChild={(nextIndex) =>
          navigate({
            to: "/donor/home",
            search: { childId: childrenWithFallbackPhotos[nextIndex]?.id },
          })
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-6">
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6 md:max-w-[760px]">
        <WelcomeBanner displayName={displayName} />

        <section>
          <h2 className="text-center font-gaegu text-[34px] font-bold text-[#173B8F] md:text-[42px]">
            Gift Commitments
          </h2>
        </section>

        <div className="flex flex-col gap-4">
          {childrenWithFallbackPhotos.length > 0 ? (
            childrenWithFallbackPhotos.map((child) => (
              <CommitmentCard key={child.id} child={child} />
            ))
          ) : (
            <Card className="rounded-[24px] border border-[#E5E7EB] p-8 text-center text-[#4B5563] shadow-sm">
              You have not claimed any gifts yet.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
