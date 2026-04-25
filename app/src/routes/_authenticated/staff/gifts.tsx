import { createFileRoute } from "@tanstack/react-router";
import { PublishedGiftsTable } from "@/components/tables/PublishedGiftsTable";
import type { PublishedGiftsTableRow } from "@/components/tables/PublishedGiftsTable";

export const Route = createFileRoute("/_authenticated/staff/gifts")({
  component: RouteComponent,
});

// Sample data - replace with actual data from database
const sampleGiftData: Array<PublishedGiftsTableRow> = [];

function RouteComponent() {
  return (
    <div className="w-full p-6">
      <div className="space-y-6">
        <PublishedGiftsTable data={sampleGiftData} rowsPerPage={10} />
      </div>
    </div>
  );
}
