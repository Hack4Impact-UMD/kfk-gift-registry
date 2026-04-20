import { ApprovedProfilesTable } from "@/components/tables/ApprovedProfilesTable/ApprovedProfilesTable";
import { createFileRoute } from "@tanstack/react-router";
import { useApprovedProfileTableRows } from "@/hooks/queries/useApprovedProfileTableRows";
import { useDrive } from "@/context/DriveContext";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/_authenticated/staff/approved")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeDriveId } = useDrive();
  const { data, isPending, error } = useApprovedProfileTableRows(activeDriveId);
  if (isPending) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2">
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
    <div className="">
      <ApprovedProfilesTable data={data} />
    </div>
  );
}
