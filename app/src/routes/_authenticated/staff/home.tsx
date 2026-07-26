import { createFileRoute } from "@tanstack/react-router";
import { useDrive } from "@/context/DriveContext";
import { useAdminDashboardMetrics } from "@/hooks/queries/useAdminDashboardMetrics";
import { useAllGiftDrives } from "@/hooks/queries/useAllGiftDrives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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

function DashboardShell() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getInitials(displayName?: string) {
  if (!displayName) return "U";
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function DashboardHeader({
  displayName,
  driveLabel,
}: {
  displayName?: string;
  driveLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kfk-blue text-2xl font-semibold text-white shadow-sm">
            {getInitials(displayName)}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, {displayName ?? "User"}!
            </h1>
            <p className="text-sm text-muted-foreground">KFK Admin</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="py-5 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Kisses For Kyle {driveLabel} Stats
          </h2>
        </CardContent>
      </Card>
    </div>
  );
}

function ThankYouBanner() {
  return (
    <Card className="overflow-hidden border-0 bg-kfk-blue text-white shadow-sm">
      <CardContent className="relative flex flex-col gap-6 px-8 py-8 md:flex-row md:items-center md:justify-between">
        <div
          className={cn(
            "absolute inset-0 opacity-10",
            "bg-[linear-gradient(135deg,transparent_0%,transparent_35%,white_35%,white_42%,transparent_42%,transparent_100%)]",
          )}
        />
        <div className="relative z-10 max-w-3xl space-y-3">
          <h3 className="font-['Gaegu'] text-4xl font-bold tracking-wide">
            Thank you!
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-white/90 md:text-base">
            Thank you for all the behind-the-scenes effort you put into our
            Annual Gift Drive. The KFK Annual Gift Drive truly would not be
            possible without your dedication, time, and support of our admins
            and volunteers. Let&apos;s keep spreading joy to our KFK families!
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-center self-end md:self-auto">
          <div className="rounded-full bg-white/10 p-5 shadow-inner">
            <div className="text-7xl leading-none">🎁</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  lastUpdatedAt,
  children,
}: {
  title: string;
  lastUpdatedAt: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-center text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        <p className="text-center text-sm text-muted-foreground">
          Last Updated: {new Date(lastUpdatedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number }> }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  return (
    <div className="rounded-md border bg-white px-3 py-2 text-sm shadow-md">
      <div className="font-medium text-foreground">{item.name}</div>
      <div className="text-muted-foreground">{item.value ?? 0}</div>
    </div>
  );
}

function FullPieChart({
  slices,
}: {
  slices: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}) {
  const chartData = slices.map((slice) => ({
    name: slice.label,
    value: slice.value,
    fill: slice.color,
  }));

  return (
    <div className="mx-auto h-[360px] w-full max-w-[520px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="88%"
            labelLine={false}
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function GiftsPurchasedCard({
  breakdown,
  lastUpdatedAt,
}: {
  breakdown: {
    unpurchased: number;
    purchasedByDonors: number;
    purchasedByAdmins: number;
  };
  lastUpdatedAt: string;
}) {
  const slices = [
    {
      label: "Unpurchased",
      value: breakdown.unpurchased,
      color: "#fbbf24",
      textColor: "#111827",
    },
    {
      label: "Purchased By Donors",
      value: breakdown.purchasedByDonors,
      color: "#ff0000",
    },
    {
      label: "Purchased By Admins",
      value: breakdown.purchasedByAdmins,
      color: "#1d4ed8",
    },
  ];

  return (
    <MetricCard title="Gifts Purchased/Unpurchased" lastUpdatedAt={lastUpdatedAt}>
      <FullPieChart slices={slices} />
    </MetricCard>
  );
}

function GiftStatusCard({
  breakdown,
  lastUpdatedAt,
}: {
  breakdown: {
    unclaimed: number;
    unordered: number;
    inTransit: number;
    delivered: number;
    received: number;
  };
  lastUpdatedAt: string;
}) {
  const slices = [
    {
      label: "Received",
      value: breakdown.received,
      color: "#6d8fe9",
    },
    {
      label: "Unclaimed",
      value: breakdown.unclaimed,
      color: "#ff0000",
    },
    {
      label: "Unordered",
      value: breakdown.unordered,
      color: "#fbbf24",
      textColor: "#111827",
    },
    {
      label: "Delivered",
      value: breakdown.delivered,
      color: "#102a72",
    },
    {
      label: "In-Transit",
      value: breakdown.inTransit,
      color: "#3f69d8",
    },
  ];

  return (
    <MetricCard title="Gift Status" lastUpdatedAt={lastUpdatedAt}>
      <FullPieChart slices={slices} />
    </MetricCard>
  );
}

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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Dashboard metrics connected</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
              <div>Total gifts: {data.gifts.total}</div>
              <div>Total families: {data.familyProfiles.total}</div>
              <div>Published child profiles: {data.approvedChildProfiles.published}</div>
              <div>People donated: {data.peopleDonated}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
