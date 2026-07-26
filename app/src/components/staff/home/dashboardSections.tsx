import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import RedGift from "@/assets/red-gift.png";
import { XIcon } from "lucide-react";

const bannerPatternClass =
  "absolute inset-0 opacity-15 bg-[repeating-linear-gradient(135deg,transparent_0px,transparent_34px,white_34px,white_42px,transparent_42px,transparent_76px)]";

export function DashboardShell({
  displayName,
  driveLabel,
}: {
  displayName?: string;
  driveLabel: string;
}) {
  return (
    <>
      <DashboardHeaderSkeleton
        displayName={displayName}
        driveLabel={driveLabel}
      />
      <ThankYouBannerSkeleton />

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <MetricCardSkeleton key={`chart-shell-${index}`} titleWidth="w-52">
            <Skeleton className="mx-auto h-[360px] w-full max-w-[560px] rounded-full" />
            <LastUpdatedSkeleton />
          </MetricCardSkeleton>
        ))}
      </div>

      <MetricCardSkeleton titleWidth="w-48">
        <div className="space-y-6 px-2">
          <Skeleton className="h-9 w-full rounded-full" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`family-shell-${index}`}
                className="flex items-center justify-center gap-2"
              >
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-5 w-28" />
              </div>
            ))}
          </div>
        </div>
        <LastUpdatedSkeleton />
      </MetricCardSkeleton>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          {
            accentClassName: "border-kfk-green",
            backgroundClassName: "bg-kfk-muted-green/35",
          },
          {
            accentClassName: "border-kfk-blue",
            backgroundClassName: "bg-kfk-light-blue/55",
          },
        ].map((card, index) => (
          <Card
            key={`summary-shell-${index}`}
            className="rounded-[28px] border-0 bg-white shadow-sm"
          >
            <CardContent className="space-y-6 px-6 pb-6 pt-8">
              <div className="flex items-center justify-center">
                <div
                  className={cn(
                    "flex min-h-40 w-full max-w-[360px] flex-col items-center justify-center rounded-2xl border-[3px] px-6 py-8 text-center shadow-sm",
                    card.accentClassName,
                    card.backgroundClassName,
                  )}
                >
                  <Skeleton className="h-12 w-32 bg-white/60" />
                  <Skeleton className="mt-3 h-6 w-40 bg-white/60" />
                </div>
              </div>
              <LastUpdatedSkeleton />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function DashboardHeaderSkeleton({
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
          <Skeleton className="h-16 w-16 rounded-full bg-kfk-blue/20" />
          <div className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              Welcome, {displayName ?? "User"}!
            </div>
            <Skeleton className="h-4 w-20" />
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

function ThankYouBannerSkeleton() {
  return (
    <Card className="overflow-hidden border-0 bg-kfk-blue text-white shadow-sm">
      <CardContent className="relative flex flex-col gap-6 px-8 py-8 md:flex-row md:items-center md:justify-between">
        <div className={bannerPatternClass} />
        <div className="relative z-10 flex-1 space-y-3">
          <Skeleton className="h-10 w-36 bg-white/20" />
          <Skeleton className="h-4 w-full max-w-2xl bg-white/15" />
          <Skeleton className="h-4 w-full max-w-xl bg-white/15" />
        </div>
        <Skeleton className="relative z-10 h-28 w-28 rounded-2xl bg-white/15" />
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton({
  titleWidth,
  children,
}: {
  titleWidth: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[28px] border-0 bg-white shadow-sm">
      <CardHeader className="pb-0">
        <Skeleton className={cn("mx-auto h-8", titleWidth)} />
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6 pt-2 md:px-8">
        {children}
      </CardContent>
    </Card>
  );
}

function LastUpdatedSkeleton() {
  return <Skeleton className="mx-auto h-5 w-40" />;
}

function getInitials(displayName?: string) {
  if (!displayName) return "U";
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DashboardHeader({
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

export function ThankYouBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-0 bg-kfk-blue text-white shadow-sm">
      <CardContent className="relative flex flex-col gap-6 px-8 py-8 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          aria-label="Close thank you banner"
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-3 z-20 p-1 text-white transition hover:opacity-80"
        >
          <XIcon className="h-8 w-8" strokeWidth={2.5} />
        </button>
        <div className={bannerPatternClass} />
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
        <div className="relative z-10 flex items-center justify-center self-end pr-10 md:self-auto md:pr-12">
          <img
            src={RedGift}
            alt="Red gift"
            className="h-28 w-28 object-contain"
          />
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
    <Card className="rounded-[28px] border-0 bg-white shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle className="text-center text-[1.9rem] font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6 pt-2 md:px-8">
        {children}
        <p className="text-center text-sm text-muted-foreground/80 md:text-base">
          Last Updated: {new Date(lastUpdatedAt).toLocaleDateString("en-US")}
        </p>
      </CardContent>
    </Card>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  return (
    <div className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm shadow-lg">
      <div className="font-semibold text-foreground">{item.name}</div>
      <div className="text-muted-foreground">{item.value ?? 0}</div>
    </div>
  );
}

function renderPieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  fill,
  payload,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
  fill?: string;
  payload?: { shortName?: string };
}) {
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    outerRadius == null ||
    percent == null ||
    !name ||
    percent <= 0
  ) {
    return null;
  }

  const percentage = Math.round(percent * 100);
  const showPercent = percentage >= 5;
  const showWords = percentage >= 12;

  if (!showPercent && !showWords) {
    return null;
  }

  const radius = outerRadius * (showWords ? 0.58 : 0.76);
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
  const textColor = fill === "#fbbf24" ? "#111827" : "#ffffff";
  const labelText = percentage < 20 ? (payload?.shortName ?? name) : name;
  const words = labelText.split(" ");

  return (
    <text
      x={x}
      y={y}
      fill={textColor}
      textAnchor="middle"
      dominantBaseline="middle"
      className="pointer-events-none"
    >
      {showPercent ? (
        <tspan
          x={x}
          dy={showWords ? "-0.45em" : "0"}
          style={{ fontSize: 16, fontWeight: 700 }}
        >
          {percentage}%
        </tspan>
      ) : null}
      {showWords
        ? words.map((word, index) => (
            <tspan
              key={`${labelText}-${word}-${index}`}
              x={x}
              dy={
                showPercent
                  ? index === 0
                    ? "1.25em"
                    : "1.1em"
                  : index === 0
                    ? "0"
                    : "1.1em"
              }
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              {word}
            </tspan>
          ))
        : null}
    </text>
  );
}

function FullPieChart({
  slices,
}: {
  slices: Array<{
    label: string;
    shortLabel?: string;
    value: number;
    color: string;
  }>;
}) {
  const chartData = slices.map((slice) => ({
    name: slice.label,
    shortName: slice.shortLabel,
    value: slice.value,
    fill: slice.color,
  }));

  return (
    <div className="mx-auto h-[360px] w-full max-w-[560px] md:h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="92%"
            label={renderPieLabel}
            labelLine={false}
            isAnimationActive={false}
            stroke="none"
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

export function GiftsPurchasedCard({
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
    },
    {
      label: "Purchased By Donors",
      shortLabel: "Donors",
      value: breakdown.purchasedByDonors,
      color: "#ff0000",
    },
    {
      label: "Purchased By Admins",
      shortLabel: "Admins",
      value: breakdown.purchasedByAdmins,
      color: "#1d4ed8",
    },
  ];

  return (
    <MetricCard
      title="Gifts Purchased/Unpurchased"
      lastUpdatedAt={lastUpdatedAt}
    >
      <FullPieChart slices={slices} />
    </MetricCard>
  );
}

export function GiftStatusCard({
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

function formatPercent(value: number, total: number) {
  if (total === 0) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FamilyProfilesCard({
  total,
  breakdown,
  lastUpdatedAt,
}: {
  total: number;
  breakdown: {
    approved: number;
    pending: number;
    holdfile: number;
  };
  lastUpdatedAt: string;
}) {
  const approvedWidth = formatPercent(breakdown.approved, total);
  const pendingWidth = formatPercent(breakdown.pending, total);
  const holdfileWidth = Math.max(0, 100 - approvedWidth - pendingWidth);

  return (
    <MetricCard title="Family Profiles" lastUpdatedAt={lastUpdatedAt}>
      <div className="space-y-6 px-2">
        <div className="overflow-hidden rounded-full border-2 border-black/80 bg-muted">
          <div className="flex h-9 w-full">
            <div
              className="bg-kfk-green"
              style={{ width: `${approvedWidth}%` }}
            />
            <div
              className="bg-kfk-yellow"
              style={{ width: `${pendingWidth}%` }}
            />
            <div
              className="bg-kfk-red"
              style={{ width: `${holdfileWidth}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground md:text-base">
            <span className="h-3.5 w-3.5 rounded-full bg-kfk-green" />
            <span>Approved: {breakdown.approved}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground md:text-base">
            <span className="h-3.5 w-3.5 rounded-full bg-kfk-yellow" />
            <span>Pending: {breakdown.pending}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground md:text-base">
            <span className="h-3.5 w-3.5 rounded-full bg-kfk-red" />
            <span>Holdfile: {breakdown.holdfile}</span>
          </div>
        </div>
      </div>
    </MetricCard>
  );
}

export function SummaryStatCard({
  value,
  label,
  accentClassName,
  backgroundClassName,
  lastUpdatedAt,
}: {
  value: string;
  label: string;
  accentClassName: string;
  backgroundClassName: string;
  lastUpdatedAt: string;
}) {
  return (
    <Card className="rounded-[28px] border-0 bg-white shadow-sm">
      <CardContent className="space-y-6 px-6 pb-6 pt-8">
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "flex min-h-40 w-full max-w-[360px] flex-col items-center justify-center rounded-2xl border-[3px] px-6 py-8 text-center shadow-sm",
              accentClassName,
              backgroundClassName,
            )}
          >
            <div className="text-5xl font-bold text-foreground md:text-6xl">
              {value}
            </div>
            <div className="mt-2 text-lg font-semibold text-foreground md:text-xl">
              {label}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground/80 md:text-base">
          Last Updated: {new Date(lastUpdatedAt).toLocaleDateString("en-US")}
        </p>
      </CardContent>
    </Card>
  );
}
