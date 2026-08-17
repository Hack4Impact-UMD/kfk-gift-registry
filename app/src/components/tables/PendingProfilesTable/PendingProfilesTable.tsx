import { useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { DataTable } from "../DataTable";
import { columns } from "./columns";
import { MoveToApproveButton } from "./MoveToApproveButton";
import { PublishToStorefrontButton } from "./PublishToStorefrontButton";
import { DeleteFamiliesButton } from "./DeleteFamiliesButton";
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
  const [selectedRows, setSelectedRows] = useState<
    Array<PendingProfileTableRow>
  >([]);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [actionInFlight, setActionInFlight] = useState(false);
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

  const filteredData = useMemo(
    () =>
      statusFilter ? data.filter((row) => row.status === statusFilter) : data,
    [statusFilter, data],
  );
  const tableKey = statusFilter ?? "all";
  const selectedFamilyIds = useMemo(
    () => selectedRows.map((row) => row.id),
    [selectedRows],
  );
  const everySelectedIs = useCallback(
    (status: ApplicationStatus) =>
      selectedRows.length > 0 &&
      selectedRows.every((row) => row.status === status),
    [selectedRows],
  );

  const handleActionSuccess = useCallback(() => {
    setSelectedRows([]);
    setSelectionVersion((current) => current + 1);
  }, []);

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
          <div className="flex gap-2 sm:ml-auto">
            {statusFilter === null && (
              <>
                <MoveToApproveButton
                  familyIds={selectedFamilyIds}
                  onSuccess={handleActionSuccess}
                  disabled={actionInFlight}
                  onPendingChange={setActionInFlight}
                />
                <PublishToStorefrontButton
                  familyIds={selectedFamilyIds}
                  onSuccess={handleActionSuccess}
                  disabled={actionInFlight || !everySelectedIs("approved")}
                  onPendingChange={setActionInFlight}
                />
                <DeleteFamiliesButton
                  familyIds={selectedFamilyIds}
                  onSuccess={handleActionSuccess}
                  disabled={actionInFlight}
                  onPendingChange={setActionInFlight}
                />
              </>
            )}
            {statusFilter === "pending" && (
              <>
                <MoveToApproveButton
                  familyIds={selectedFamilyIds}
                  onSuccess={handleActionSuccess}
                  disabled={actionInFlight}
                  onPendingChange={setActionInFlight}
                />
                <DeleteFamiliesButton
                  familyIds={selectedFamilyIds}
                  onSuccess={handleActionSuccess}
                  disabled={actionInFlight}
                  onPendingChange={setActionInFlight}
                />
              </>
            )}
            {statusFilter === "approved" && (
              <PublishToStorefrontButton
                familyIds={selectedFamilyIds}
                onSuccess={handleActionSuccess}
                disabled={actionInFlight || !everySelectedIs("approved")}
                onPendingChange={setActionInFlight}
              />
            )}
            {statusFilter === "holdfile" && (
              <DeleteFamiliesButton
                familyIds={selectedFamilyIds}
                onSuccess={handleActionSuccess}
                disabled={actionInFlight}
                onPendingChange={setActionInFlight}
              />
            )}
          </div>
        </div>
      </div>

      <DataTable
        key={`${tableKey}-${selectionVersion}`}
        columns={columns}
        data={filteredData}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
        rowsPerPage={rowsPerPage}
        paginated={paginated}
        onOrderedRowsChange={(orderedRows) =>
          setReviewOrder(orderedRows.map((orderedRow) => orderedRow.id))
        }
        onSelectedRowsChange={setSelectedRows}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
