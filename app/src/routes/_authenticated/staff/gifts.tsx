import { createFileRoute } from "@tanstack/react-router";
import { PublishedGiftsTable } from "@/components/tables/PublishedGiftsTable";
import { useDrive } from "@/context/DriveContext";
import { useQuery } from "@tanstack/react-query";
import publishedGiftsQueries from "@/queries/publishedGifts";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/_authenticated/staff/gifts")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeDriveId } = useDrive();
  const tableRowsByDriveQuery = publishedGiftsQueries.tableRowsByDrive(
    activeDriveId ?? "",
  );
  const { data: tableRows = [], isLoading } = useQuery({
    ...tableRowsByDriveQuery,
    enabled: !!activeDriveId,
  });

  if (!activeDriveId) {
    return (
      <div className="p-6">Please select a gift drive from the sidebar</div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full p-2 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="space-y-6">
        <PublishedGiftsTable data={tableRows} rowsPerPage={10} />
      </div>
    </div>
  );
}
