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
import { ChildGiftTable } from "@/components/tables/ChildGiftTable/ChildGiftTable";
import { getPatternStyle } from "@/components/storefront/ChildCard";
import { useStorefrontChild } from "@/hooks/queries/useStorefrontChild";
import { useStorefrontSiblings } from "@/hooks/queries/useStorefrontSiblings";
import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { queries } from "@/queries";
import { getColorName } from "@/lib/childColors";

export const Route = createFileRoute("/_storefront/child/$childId")({
  component: RouteComponent,
  beforeLoad: async ({ params, context }) => {
    const childId = params.childId;

    await Promise.all([
      context.queryClient.ensureQueryData(
        queries.storefront.childById(childId),
      ),
      context.queryClient.ensureQueryData(
        queries.storefront.siblingsForChild(childId),
      ),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Child Profile - Kisses for Kyle" },
      {
        name: "description",
        content: "Browse gifts for a child in the Kisses for Kyle program",
      },
    ],
  }),
});

function RouteComponent() {
  const { childId } = Route.useParams();

  const {
    data: child,
    isPending: childPending,
    isError: childError,
  } = useStorefrontChild(childId);
  const {
    data: siblings,
    isPending: siblingsPending,
    isError: siblingsError,
  } = useStorefrontSiblings(childId);

  const siblingsCarouselData = useMemo(() => {
    if (!siblings) return [];

    return siblings.map(
      (sibling): CarouselCardSibling => ({
        id: sibling.id,
        name: sibling.name,
        photoUrl: sibling.photoUrl,
        category: sibling.category,
        giftsFulfilled: sibling.gifts.filter((g) =>
          ["CLAIMED", "PURCHASED", "DELIVERED", "RECEIVED"].includes(g.status),
        ).length,
        giftsTotal: sibling.gifts.length,
      }),
    );
  }, [siblings]);

  if (childPending || siblingsPending) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (childError || siblingsError) {
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
  const color = getColorName(child.familyId);

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div
            className="w-full p-3 md:p-8 rounded-3xl bg-cover bg-center flex items-center justify-center"
            style={getPatternStyle(color)}
          >
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 items-center md:items-stretch w-full">
              <div className="w-full max-w-sm md:max-w-none md:flex-1 md:min-w-0">
                <ChildInfoCard child={child} className="h-full" />
              </div>

              <div className="w-full md:max-w-none md:flex-2 md:min-w-0">
                <Card className="w-full h-full" data-tour="child-wishlist">
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

      {siblingsCarouselData.length > 0 && (
        <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 font-gaegu">
              {firstName}'s Siblings
            </h2>
            <SiblingsCarousel siblings={siblingsCarouselData} />
          </div>
        </div>
      )}
    </div>
  );
}
