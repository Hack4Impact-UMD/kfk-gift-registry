import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { GiftStatus } from "common";
import { DataTable } from "../DataTable";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { downloadCsv, serializeCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { StatusSummaryHeader } from "./StatusSummaryHeader";
import {
  GiftStatusFilterChips,
  getVisibleGiftStatuses,
} from "./GiftStatusFilterChips";
import type { GiftClaimStatus, PublishedGiftsTableRow } from "./types";

interface PublishedGiftsTableProps {
  data: Array<PublishedGiftsTableRow>;
  className?: string;
  /** Filter by sponsor type (passed in from header cards) **/
  sponsorTypeFilter?: GiftClaimStatus | null;
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
  const [activeFilter, setActiveFilter] = useState<GiftClaimStatus | null>(
    sponsorTypeFilter,
  );
  const [giftStatusFilter, setGiftStatusFilter] = useState<GiftStatus | null>(
    null,
  );

  const filteredData = useMemo(() => {
    let result = data;

    if (activeFilter === "claimed") {
      result = result.filter(
        (row) =>
          row.sponsorType === "claimed_kfk" ||
          row.sponsorType === "claimed_donor" ||
          row.sponsorType === "claimed",
      );
    } else if (activeFilter) {
      result = result.filter((row) => row.sponsorType === activeFilter);
    }

    if (giftStatusFilter) {
      result = result.filter((row) => row.giftStatus === giftStatusFilter);
    }

    return result;
  }, [activeFilter, giftStatusFilter, data]);

  const exportData = useMemo(() => {
    const normalizedSearch = globalSearch.trim().toLowerCase();
    if (!normalizedSearch) return filteredData;

    return filteredData.filter((row) =>
      [
        row.giftName,
        row.giftStatus,
        row.sponsorType,
        row.sponsorName,
        row.sponsorEmail,
        row.dateOfFulfillment,
        row.productUrl,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [filteredData, globalSearch]);

  const tableKey = `${activeFilter ?? "all"}-${giftStatusFilter ?? "all"}`;

  const handleExport = () => {
    const csv = serializeCsv(exportData, [
      { header: "Gift Name", value: (row) => row.giftName },
      { header: "Gift Status", value: (row) => row.giftStatus },
      { header: "Sponsor Type", value: (row) => row.sponsorType },
      { header: "Sponsor Name", value: (row) => row.sponsorName },
      { header: "Sponsor Email", value: (row) => row.sponsorEmail },
      {
        header: "Date of Fulfillment",
        value: (row) => row.dateOfFulfillment,
      },
      { header: "Product URL", value: (row) => row.productUrl },
    ]);

    downloadCsv("published-gifts.csv", csv);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Status Summary Cards */}
      <StatusSummaryHeader
        data={data}
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter);
          const visible = getVisibleGiftStatuses(filter);
          if (
            !visible ||
            (giftStatusFilter && !visible.includes(giftStatusFilter))
          ) {
            setGiftStatusFilter(null);
          }
        }}
      />

      {/* Search, Gift Status Filter, and Export */}
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
        {activeFilter !== "unclaimed" && (
          <div className="mt-3 border-t pt-3">
            <GiftStatusFilterChips
              activeFilter={giftStatusFilter}
              claimFilter={activeFilter}
              onFilterChange={setGiftStatusFilter}
            />
          </div>
        )}
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
