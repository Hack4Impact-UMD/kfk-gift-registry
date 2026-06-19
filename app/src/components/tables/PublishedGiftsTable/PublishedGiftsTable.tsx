import { useState } from "react";
import { Search } from "lucide-react";
import { DataTable } from "../DataTable";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusSummaryHeader } from "./StatusSummaryHeader";
import type { GiftPurchaseStatus, PublishedGiftsTableRow } from "./types";

interface PublishedGiftsTableProps {
  data: Array<PublishedGiftsTableRow>;
  className?: string;
  /** Filter by sponsor type (passed in from header cards) **/
  sponsorTypeFilter?: GiftPurchaseStatus | null;
  rowsPerPage?: number;
  paginated?: boolean;
}

export function PublishedGiftsTable({
  data,
  className = "",
  sponsorTypeFilter = null,
  rowsPerPage = 10,
  paginated = true,
}: PublishedGiftsTableProps) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<GiftPurchaseStatus | null>(
    sponsorTypeFilter,
  );

  // Apply filter from header cards (if any)
  const filteredData =
    activeFilter === "purchased"
      ? data.filter(
          (row) =>
            row.sponsorType === "purchased" ||
            row.sponsorType === "purchased_kfk" ||
            row.sponsorType === "purchased_donor",
        )
      : activeFilter
        ? data.filter((row) => row.sponsorType === activeFilter)
        : data;

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export clicked");
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Status Summary Cards */}
      <StatusSummaryHeader
        data={data}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Search and Export */}
      <div className="rounded-md border bg-card px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex w-full items-center sm:mr-auto sm:w-56">
            <Search className="absolute left-2 h-4 w-4 text-gray-500 pointer-events-none" />
            <Input
              placeholder="Search"
              aria-label="Search gifts"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-8 border-gray-300 text-gray-700 focus-visible:ring-1"
            />
          </div>
          <Button
            onClick={handleExport}
            className="sm:ml-auto flex items-center gap-2 bg-kfk-blue text-white hover:bg-kfk-blue/90"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
        rowsPerPage={rowsPerPage}
        paginated={paginated}
      />
    </div>
  );
}
