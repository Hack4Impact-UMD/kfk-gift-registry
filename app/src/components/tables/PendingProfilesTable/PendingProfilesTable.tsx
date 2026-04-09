import { useState } from "react";
import { Search } from "lucide-react";
import { DataTable } from "../DataTable";
import { columns } from "./columns";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PendingProfileTableRow } from "./types";

interface PendingProfilesTableProps {
  data: Array<PendingProfileTableRow>;
  className?: string;
  /** Filter by status (passed in from header cards) **/
  statusFilter?: string | null;
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

  // Apply filter from header cards (if any)
  const filteredData = statusFilter
    ? data.filter((row) => row.status === statusFilter)
    : data;

  return (
    <div className={cn("flex flex-col gap-4 pt-6", className)}>
      <div className="flex items-center px-1">
        <div className="relative flex items-center mr-auto w-56">
          <Search className="absolute left-2 h-4 w-4 text-gray-500 pointer-events-none" />
          <Input
            placeholder="Search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-8 border-gray-300 text-gray-700 focus-visible:ring-1"
          />
        </div>
      </div>

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