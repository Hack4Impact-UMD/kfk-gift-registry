import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { DataTable } from "../DataTable";
import { columns } from "./columns";
import { PendingProfilesTableActionButton } from "./PendingProfilesTableActionButton";
import { Input } from "@/components/ui/input";
import { useReviewOrder } from "@/context/ReviewOrderContext";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, PendingProfileTableRow } from "./types";

interface PendingProfilesTableProps {
  data: Array<PendingProfileTableRow>;
  className?: string;
  /** Filter by status (passed in from header cards) **/
  statusFilter?: ApplicationStatus | null;
  rowsPerPage?: number;
  paginated?: boolean;
}

export function PendingProfilesTable({
  data,
  className = "",
  statusFilter = null,
  rowsPerPage = 20,
  paginated = true,
}: PendingProfilesTableProps) {
  const [globalSearch, setGlobalSearch] = useState("");
  const navigate = useNavigate();
  const { setReviewOrder } = useReviewOrder();

  const handleRowClick = (
    row: PendingProfileTableRow,
    orderedRows: Array<PendingProfileTableRow>,
  ) => {
    setReviewOrder(orderedRows.map((orderedRow) => orderedRow.id));
    navigate({
      to: "/staff/review/$familyId",
      params: { familyId: row.id },
    });
  };

  const filteredData = statusFilter
    ? data.filter((row) => row.status === statusFilter)
    : data;
  const tableKey = statusFilter ?? "all";

  return (
    <div className={cn("flex flex-col gap-4 pt-6", className)}>
      <div className="rounded-md border bg-card px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex w-full items-center sm:mr-auto sm:w-56">
            <Search className="absolute left-2 h-4 w-4 text-gray-500 pointer-events-none" />
            <Input
              placeholder="Search"
              aria-label="Search pending profiles"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-8 border-gray-300 text-gray-700 focus-visible:ring-1"
            />
          </div>
          <PendingProfilesTableActionButton
            className="sm:ml-auto"
            statusFilter={statusFilter}
          />
        </div>
      </div>

      <DataTable
        key={tableKey}
        columns={columns}
        data={filteredData}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
        rowsPerPage={rowsPerPage}
        paginated={paginated}
        onOrderedRowsChange={(orderedRows) =>
          setReviewOrder(orderedRows.map((orderedRow) => orderedRow.id))
        }
        onRowClick={handleRowClick}
      />
    </div>
  );
}
