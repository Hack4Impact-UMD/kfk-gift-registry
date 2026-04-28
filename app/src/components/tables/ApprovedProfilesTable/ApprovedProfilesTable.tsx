import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { DataTable } from "../DataTable";
import { columns } from "./columns";
import type { ApprovedProfileTableRow, ChildProfileVisibility } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ApprovedProfilesTableProps {
  data: Array<ApprovedProfileTableRow>;
  className?: string;
  statusFilter?: ChildProfileVisibility | null;
  rowsPerPage?: number;
  paginated?: boolean;
}

export function ApprovedProfilesTable({
  data,
  className = "",
  statusFilter = null,
  rowsPerPage = 20,
  paginated = true,
}: ApprovedProfilesTableProps) {
  const [globalSearch, setGlobalSearch] = useState("");
  const navigate = useNavigate();
  const filteredData = statusFilter
    ? data.filter((row) =>
        statusFilter === "published" ? row.published : !row.published,
      )
    : data;
  const tableKey = statusFilter ?? "all";

  return (
    <div className={cn("flex flex-col gap-4 pt-6 w-full", className)}>
      <div className="rounded-md border bg-card px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex w-full items-center sm:mr-auto sm:w-56">
            <Search className="absolute left-2 h-4 w-4 text-gray-500 pointer-events-none" />
            <Input
              placeholder="Search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-8 border-gray-300 text-gray-700 focus-visible:ring-1"
            />
          </div>
          <Button className="sm:ml-auto">Unpublish</Button>
        </div>
      </div>
      <DataTable
        key={tableKey}
        className="w-full"
        columns={columns}
        data={filteredData}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
        rowsPerPage={rowsPerPage}
        paginated={paginated}
        onRowClick={(row) => {
          navigate({
            to: "/staff/child/$childId",
            params: { childId: row.id },
          });
        }}
      />
    </div>
  );
}
