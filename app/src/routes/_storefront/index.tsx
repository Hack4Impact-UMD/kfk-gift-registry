import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GiftDriveStats } from "@/components/storefront/GiftDriveStats";
import { OffSeasonScreen } from "@/components/storefront/OffSeasonScreen";
import type { ChildCardData } from "@/components/storefront/ChildCard";
import { ChildCard } from "@/components/storefront/ChildCard";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Pagination } from "@/components/storefront/Pagination";
import { StorefrontSearchFilters } from "@/components/storefront/StorefrontSearchFilters";
import type { StorefrontSortOption } from "@/components/storefront/StorefrontSearchFilters";
import { queries } from "@/queries";
import { useStorefrontChildProfiles } from "@/hooks/queries/useStorefrontChildProfiles";
import { useStorefrontUniqueDonors } from "@/hooks/queries/useStorefrontUniqueDonors";
import { Spinner } from "@/components/ui/spinner";
import { DateTime } from "luxon";

export const Route = createFileRoute("/_storefront/")({
  validateSearch: z.object({
    search: z.string().optional(),
    sort: z
      .enum(["age-asc", "age-desc", "gifts-asc", "gifts-desc", "none"])
      .optional(),
    page: z.number().gt(0).default(1),
  }),
  loader: async ({ context }) => {
    const driveId = context.currentDrive?.id;
    if (driveId) {
      await Promise.all([
        context.queryClient.ensureQueryData(
          queries.storefront.profilesForDrive(driveId),
        ),
        context.queryClient.ensureQueryData(
          queries.storefront.uniqueDonorsForDrive(driveId),
        ),
      ]);
      return;
    }

    const drives = await context.queryClient.ensureQueryData(queries.drives.all);
    const now = DateTime.utc().toMillis();
    const latestCompletedDrive = [...drives]
      .filter((drive) => DateTime.fromISO(drive.endDate).toMillis() < now)
      .sort(
        (a, b) =>
          DateTime.fromISO(b.endDate).toMillis() -
          DateTime.fromISO(a.endDate).toMillis(),
      )[0];

    if (!latestCompletedDrive) {
      return;
    }

    await Promise.all([
      context.queryClient.ensureQueryData(
        queries.storefront.profilesForDrive(latestCompletedDrive.id),
      ),
      context.queryClient.ensureQueryData(
        queries.storefront.uniqueDonorsForDrive(latestCompletedDrive.id),
      ),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Kisses for Kyle Gift Storefront" },
      {
        name: "description",
        content:
          "Browse and claim gifts for children in our gift drive program",
      },
    ],
  }),
  component: App,
});

const familyColors = ["kfk-red", "kfk-brown", "kfk-green", "kfk-blue"];

function App() {
  const context = Route.useRouteContext();
  const {
    data: allChildren,
    isPending,
    isError,
  } = useStorefrontChildProfiles(context.currentDrive?.id);

  const {
    data: uniqueDonors,
    isPending: isUniqueDonorsPending,
    isError: isUniqueDonorsError,
  } = useStorefrontUniqueDonors(context.currentDrive?.id);

  const [childrenPerPage] = useState<number>(25);
  const navigate = useNavigate();

  const { search, sort, page } = Route.useSearch();
  const [searchValue, setSearchValue] = useState<string>(search ?? "");
  const [sortValue, setSortValue] = useState<StorefrontSortOption>(
    sort ?? "none",
  );

  useEffect(() => {
    navigate({
      to: "/",
      search: (prev) => ({
        ...prev,
        page: 1,
      }),
    });
  }, [navigate]);

  const childrenWithMetrics: Array<ChildCardData & { familyId: string }> =
    useMemo(() => {
      if (!allChildren) return [];

      return allChildren.map((child) => ({
        id: child.id,
        name: child.name,
        photoUrl: child.photoUrl,
        category: child.category,
        age: child.age,
        diagnosis: child.diagnosis,
        giftsRequested: child.gifts.length,
        giftsClaimed: child.gifts.filter((g) =>
          ["CLAIMED", "PURCHASED", "DELIVERED", "RECEIVED"].includes(g.status),
        ).length,
        familyId: child.familyId,
      }));
    }, [allChildren]);

  const { totalGifts, claimedGifts, childrenWithGifts } = useMemo(() => {
    let totalGiftsCount = 0;
    let claimedGiftsCount = 0;
    let childrenWithGiftsCount = 0;
    for (const child of childrenWithMetrics) {
      totalGiftsCount += child.giftsRequested;
      claimedGiftsCount += child.giftsClaimed;
      if (child.giftsClaimed > 0) childrenWithGiftsCount++;
    }

    return {
      totalGifts: totalGiftsCount,
      claimedGifts: claimedGiftsCount,
      childrenWithGifts: childrenWithGiftsCount,
    };
  }, [childrenWithMetrics]);

  const uniqueFamilyIds = useMemo(() => {
    if (!allChildren) return [];
    const familyIds = allChildren.map((c) => c.familyId);
    return [...new Set(familyIds)];
  }, [allChildren]);

  const filteredChildren = useMemo(
    () =>
      (searchValue
        ? childrenWithMetrics.filter(
            (child) =>
              child.name.toLowerCase().includes(searchValue.toLowerCase()) ||
              child.diagnosis
                ?.toLowerCase()
                .includes(searchValue.toLowerCase()),
          )
        : [...childrenWithMetrics]
      ).sort((a, b) => {
        if (sortValue === "age-asc") return a.age - b.age;
        if (sortValue === "age-desc") return b.age - a.age;
        if (sortValue === "gifts-asc") return a.giftsClaimed - b.giftsClaimed;
        if (sortValue === "gifts-desc") return b.giftsClaimed - a.giftsClaimed;
        return 0;
      }),
    [searchValue, sortValue, childrenWithMetrics],
  );

  const lastChildIndex = page * childrenPerPage;
  const firstChildIndex = lastChildIndex - childrenPerPage;
  const currentChildrenProfiles = filteredChildren.slice(
    firstChildIndex,
    lastChildIndex,
  );

  if (!context.currentDrive) {
    return <OffSeasonScreen />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-gaegu text-red-600">
          Error loading children profiles. Please try again later.
        </p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!allChildren || allChildren.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-gaegu">
          No children profiles available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <StorefrontSearchFilters
          searchValue={searchValue}
          sortValue={sortValue}
          onSearchChange={setSearchValue}
          onSortChange={setSortValue}
        />
        <GiftDriveStats
          drive={context.currentDrive}
          giftsClaimed={claimedGifts}
          totalGifts={totalGifts}
          childrenWithGifts={childrenWithGifts}
          totalDonated={isUniqueDonorsError ? undefined : uniqueDonors}
          totalDonatedPending={isUniqueDonorsPending}
        />
      </div>

      <div className="py-4 px-2 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {currentChildrenProfiles.map((child) => {
            const familyIndex = uniqueFamilyIds.indexOf(child.familyId);
            const color = familyColors[familyIndex % familyColors.length];

            return (
              <Link
                key={child.id}
                to="/child/$childId"
                params={{ childId: child.id }}
                className="block transition-transform duration-200 ease-out hover:scale-105 hover:z-10"
              >
                <ChildCard child={child} color={color} />
              </Link>
            );
          })}
        </div>

        <Pagination
          totalChildren={filteredChildren.length}
          childrenPerPage={childrenPerPage}
          setCurrentPage={(p) =>
            navigate({
              to: "/",
              search: (prev) => ({
                ...prev,
                page: p,
              }),
            })
          }
          currentPage={page}
          maxButtons={9}
          immediatePages={4}
        />
      </div>
    </div>
  );
}
