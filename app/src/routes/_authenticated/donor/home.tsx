import { createFileRoute } from "@tanstack/react-router";
import { HomeHeaderCard } from "@/components/donor/HomeHeaderCard";
import { ChildBlock } from "@/components/donor/home/ChildBlock";
import DefaultProfile from "@/assets/default-profile-photo.png";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { useDonorCommittedChildren } from "@/hooks/queries/useDonorCommittedChildren";
import { queries } from "@/queries";

export const Route = createFileRoute("/_authenticated/donor/home")({
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

  if (isError) {
    return (
      <div className="bg-muted/20 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <HomeHeaderCard
            displayName={auth.authUser.displayName ?? "Unnamed User"}
          />
          <Card className="w-full p-8 text-center">
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

  return (
    <div className="bg-muted/20 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 overflow-x-hidden">
        <HomeHeaderCard
          displayName={auth.authUser.displayName ?? "Unnamed User"}
        />
        <div className="flex w-full min-w-0 flex-col gap-6">
          {childrenWithFallbackPhotos.length > 0 ? (
            childrenWithFallbackPhotos.map((child) => (
              <ChildBlock key={child.id} child={child} />
            ))
          ) : (
            <Card className="w-full p-8 text-center">
              You have not claimed any gifts yet.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
