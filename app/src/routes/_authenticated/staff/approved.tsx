import { ApprovedProfilesTable } from "@/components/tables/ApprovedProfilesTable/ApprovedProfilesTable";
import { createFileRoute } from "@tanstack/react-router";
import { useApprovedProfileTableRows } from "@/hooks/queries/useApprovedProfileTableRows";
import { useDrive } from "@/context/DriveContext";

export const Route = createFileRoute("/_authenticated/staff/approved")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeDriveId } = useDrive();
  const { data, isPending, error } = useApprovedProfileTableRows(activeDriveId);
  if (isPending) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  // if (!data || data.length === 0) {
  //   return <div>No approved profiles found for this drive.</div>;
  // }

  return <div className="">
    <ApprovedProfilesTable data={data} />
  </div>;
}
