import { createFileRoute } from "@tanstack/react-router";
import { ChildInfoCard } from "@/components/storefront/ChildInfoCard";
import type { CarouselCardSibling } from "@/components/storefront/CarouselCards";
import { SiblingsCarousel } from "@/components/storefront/SiblingsCarousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StorefrontChild } from "@/types/storefront";
import { ChildGiftTable } from "@/components/tables/ChildGiftTable/ChildGiftTable";
import redStripedBackground from "@/assets/red-striped-background.png";
import { queries } from "@/queries";
import { useStorefrontChildProfiles } from "@/hooks/queries/useStorefrontChildProfiles";
import { useMemo } from "react";

export const Route = createFileRoute("/_storefront/child/$childId")({
  loader: async ({ context }) => {
    const driveId = context.currentDrive?.id;
    if (driveId) {
      await context.queryClient.ensureQueryData(
        queries.storefront.profilesForDrive(driveId),
      );
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { childId } = Route.useParams();
  const context = Route.useRouteContext();
  const driveId = context.currentDrive?.id ?? "";

  const { data: allChildren, isLoading, isError } = useStorefrontChildProfiles(driveId);

  const child = useMemo(() => {
    if (!allChildren) return undefined;
    return allChildren.find((c) => c.id === childId);
  }, [allChildren, childId]);

  const siblings = useMemo(() => {
    if (!allChildren || !child) return [];
    
    return allChildren
      .filter((c) => c.familyId === child.familyId && c.id !== childId)
      .map((sibling): CarouselCardSibling => ({
        id: sibling.id,
        name: sibling.name,
        photoUrl: sibling.photoUrl,
        category: sibling.category,
        giftsFulfilled: sibling.gifts.filter((g) =>
          ["CLAIMED", "PURCHASED", "DELIVERED", "RECEIVED"].includes(g.status),
        ).length,
        giftsTotal: sibling.gifts.length,
      }));
  }, [allChildren, child, childId]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen">
        <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-lg font-gaegu">Loading child profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-screen">
        <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-lg font-gaegu text-red-600">
              Error loading child profile. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="w-full min-h-screen">
        <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 font-gaegu">
              Child Not Found
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const firstName = child.name.trim().split(" ")[0] || child.name;

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div
            className="w-full px-3 py-8 sm:py-8 md:py-10 lg:px-12 lg:py-12 rounded-3xl bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${redStripedBackground})` }}
          >
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 items-center md:items-stretch w-full">
              <div className="w-full max-w-sm md:max-w-none md:flex-1 md:min-w-0">
                <ChildInfoCard child={child} className="h-full" />
              </div>

              <div className="w-full md:max-w-none md:flex-2 md:min-w-0">
                <Card className="w-full h-full">
                  <CardHeader className="py-2 sm:py-6">
                    <CardTitle className="text-2xl sm:text-3xl text-center font-gaegu">
                      {firstName}'s Wish List
                    </CardTitle>
                    <CardDescription className="font-gaegu text-center text-muted-foreground md:text-lg">
                      Please check links before claiming as prices may change
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <ChildGiftTable gifts={child.gifts} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {siblings.length > 0 && (
        <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 font-gaegu">
              {firstName}'s Siblings
            </h2>
            <SiblingsCarousel siblings={siblings} />
          </div>
        </div>
      )}
    </div>
  );
}
