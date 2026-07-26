import { createFileRoute } from "@tanstack/react-router";
import { useDrive } from "@/context/DriveContext";
import { useAdminDashboardMetrics } from "@/hooks/queries/useAdminDashboardMetrics";
import { useAllGiftDrives } from "@/hooks/queries/useAllGiftDrives";
import {
  DashboardHeader,
  DashboardShell,
  FamilyProfilesCard,
  formatCurrency,
  GiftsPurchasedCard,
  GiftStatusCard,
  SummaryStatCard,
  ThankYouBanner,
} from "@/components/staff/home/dashboardSections";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/staff/home")({
  head: () => ({
    meta: [
      { title: "Dashboard - Staff" },
      {
        name: "description",
        content: "Staff dashboard for managing the gift drive program",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const routeContext = Route.useRouteContext();
  const { activeDriveId } = useDrive();
  const { data: drives = [] } = useAllGiftDrives();
  const { data, isPending, error } = useAdminDashboardMetrics(activeDriveId);
  const activeDrive = drives.find((drive) => drive.id === activeDriveId);
  const driveLabel = activeDrive?.cycle ?? "Selected Drive";

  if (!activeDriveId) {
    return (
      <div className="p-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Please select a gift drive from the sidebar.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="bg-muted/20 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <DashboardShell />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 text-center text-red-500">
            Failed to load dashboard metrics: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 text-center text-muted-foreground">
            No dashboard data is available for this drive yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <DashboardHeader
          displayName={routeContext.auth.authUser.displayName}
          driveLabel={driveLabel}
        />
        <ThankYouBanner />

        <div className="grid gap-6 lg:grid-cols-2">
          <GiftsPurchasedCard
            breakdown={data.gifts.breakdown}
            lastUpdatedAt={data.lastUpdatedAt}
          />
          <GiftStatusCard
            breakdown={data.gifts.statusBreakdown}
            lastUpdatedAt={data.lastUpdatedAt}
          />
        </div>

        <FamilyProfilesCard
          total={data.familyProfiles.total}
          breakdown={data.familyProfiles.breakdown}
          lastUpdatedAt={data.lastUpdatedAt}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <SummaryStatCard
            value={formatCurrency(data.donationAmount)}
            label="Donation Amount"
            accentClassName="border-kfk-green"
            backgroundClassName="bg-kfk-muted-green/35"
            lastUpdatedAt={data.lastUpdatedAt}
          />
          <SummaryStatCard
            value={String(data.peopleDonated)}
            label="People Donated"
            accentClassName="border-kfk-blue"
            backgroundClassName="bg-kfk-light-blue/55"
            lastUpdatedAt={data.lastUpdatedAt}
          />
        </div>
      </div>
    </div>
  );
}
