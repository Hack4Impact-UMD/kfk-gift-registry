import { ApprovedProfilesTable } from "@/components/tables/ApprovedProfilesTable/ApprovedProfilesTable";
import { createFileRoute } from "@tanstack/react-router";
import { useApprovedProfileTableRows } from "@/hooks/queries/useApprovedProfileTableRows";
import { useDrive } from "@/context/DriveContext";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { StatusSummaryHeader } from "@/components/tables/ApprovedProfilesTable/StatusSummaryHeader";
import type { ChildProfileVisibility } from "@/components/tables/ApprovedProfilesTable/types";

export const Route = createFileRoute("/_authenticated/staff/child-profile")({
  head: () => ({
    meta: [
      { title: "Child Profiles - Staff" },
      {
        name: "description",
        content: "View and manage approved child profiles",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { activeDriveId } = useDrive();
  const { data, isPending, error } = useApprovedProfileTableRows(activeDriveId);
  const [activeFilter, setActiveFilter] =
    useState<ChildProfileVisibility | null>(null);
  if (isPending) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2">
        <span className="text-center pr-1 ">Loading... </span>
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2">
        <p className="text-center text-kfk-red">
          Failed to load approved profile data: {error.message}
        </p>
      </div>
    );
  }
  // if (!data || data.length === 0) {
  //   return <div>No approved profiles found for this drive.</div>;
  // }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Child Profiles</h1>
      </div>
      <StatusSummaryHeader
        data={data ?? []}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <ApprovedProfilesTable data={data ?? []} statusFilter={activeFilter} />
    </div>
  );
}
