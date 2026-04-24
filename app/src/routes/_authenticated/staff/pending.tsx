import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PendingProfilesTable } from "@/components/tables/PendingProfilesTable/PendingProfilesTable";
import { StatusSummaryHeader } from "@/components/tables/PendingProfilesTable/StatusSummaryHeader";
import type { ApplicationStatus } from "@/components/tables/PendingProfilesTable/types";
import { usePendingProfileTableRows } from "@/hooks/queries/usePendingProfileTableRows";
import { useDrive } from "@/context/DriveContext";

export const Route = createFileRoute("/_authenticated/staff/pending")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeDriveId } = useDrive();
  const { data, isPending, error } = usePendingProfileTableRows(activeDriveId);
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | null>(
    null,
  );

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Family Approval</h1>
      </div>
      <StatusSummaryHeader
        data={data ?? []}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <PendingProfilesTable data={data ?? []} statusFilter={activeFilter} />
    </div>
  );
}
