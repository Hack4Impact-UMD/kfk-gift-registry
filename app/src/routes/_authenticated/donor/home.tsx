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
    await context.queryClient.ensureQueryData(queries.donor.home);
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
  const { auth } = Route.useRouteContext();
  const {
    data: committedChildren,
    isPending,
    isError,
  } = useDonorCommittedChildren();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-10 overflow-x-hidden p-5 items-center">
        <HomeHeaderCard
          displayName={auth.authUser.displayName ?? "Unnamed User"}
        />
        <Card className="w-full max-w-150 p-8 text-center">
          Unable to load your committed gifts. Please try again.
        </Card>
      </div>
    );
  }

  const childrenWithFallbackPhotos = (committedChildren ?? []).map((child) => ({
    ...child,
    photoUrl: child.photoUrl || DefaultProfile,
  }));

  return (
    <div className="flex flex-col gap-10 overflow-x-hidden p-5 items-center">
      <HomeHeaderCard
        displayName={auth.authUser.displayName ?? "Unnamed User"}
      />
      <div className="w-full min-w-0 max-w-150 flex flex-col gap-6 items-center">
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
  );
}
