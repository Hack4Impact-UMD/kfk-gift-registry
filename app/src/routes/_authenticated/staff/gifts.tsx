import { createFileRoute } from "@tanstack/react-router";
import { PublishedGiftsTable } from "@/components/tables/PublishedGiftsTable";
import type { PublishedGiftsTableRow } from "@/components/tables/PublishedGiftsTable";
import { useDrive } from "@/context/DriveContext";
import { useQuery } from "@tanstack/react-query";
import { publishedGiftsQueries } from "@/queries/publishedGifts";

export const Route = createFileRoute("/_authenticated/staff/gifts")({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeDriveId } = useDrive();
  const { data: gifts = [], isLoading } = useQuery({
    ...publishedGiftsQueries.byDrive(activeDriveId!),
    enabled: !!activeDriveId,
  });

  if (!activeDriveId) {
    return (
      <div className="p-6">Please select a gift drive from the sidebar</div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const tableData: Array<PublishedGiftsTableRow> = gifts.map((gift) => ({
    id: gift.id,
    giftName: gift.title,
    giftStatus: gift.status,
    sponsorType: "unpurchased",
    productUrl: gift.productUrl,
  }));

  return (
    <div className="w-full p-6">
      <div className="space-y-6">
        <PublishedGiftsTable data={tableData} rowsPerPage={10} />
      </div>
    </div>
  );
}
