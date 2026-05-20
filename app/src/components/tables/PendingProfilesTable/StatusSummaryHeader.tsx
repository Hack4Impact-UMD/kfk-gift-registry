import { useCallback, useMemo } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { UsersIcon } from "@/components/icons";
import type { ApplicationStatus, PendingProfileTableRow } from "./types";
import { StatusSummaryCard } from "@/components/StatusSummaryCard";

interface StatusSummaryHeaderProps {
  data: Array<PendingProfileTableRow>;
  activeFilter: ApplicationStatus | null;
  onFilterChange: (status: ApplicationStatus | null) => void;
}

export function StatusSummaryHeader({
  data,
  activeFilter,
  onFilterChange,
}: StatusSummaryHeaderProps) {
  const totalCount = data.length;
  const pendingCount = useMemo(
    () => data.filter((row) => row.status === "pending").length,
    [data],
  );
  const approvedCount = useMemo(
    () => data.filter((row) => row.status === "approved").length,
    [data],
  );
  const holdfileCount = useMemo(
    () => data.filter((row) => row.status === "holdfile").length,
    [data],
  );

  const handleAllClick = useCallback(
    () => onFilterChange(null),
    [onFilterChange],
  );
  const handlePendingClick = useCallback(
    () => onFilterChange("pending"),
    [onFilterChange],
  );
  const handleApprovedClick = useCallback(
    () => onFilterChange("approved"),
    [onFilterChange],
  );
  const handleHoldfileClick = useCallback(
    () => onFilterChange("holdfile"),
    [onFilterChange],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusSummaryCard
        label="All Profiles"
        count={totalCount}
        icon={<UsersIcon />}
        variant="all"
        onClick={handleAllClick}
        isActive={activeFilter === null}
      />
      <StatusSummaryCard
        label="Pending Review"
        count={pendingCount}
        icon={<Clock size={24} />}
        variant="pending"
        onClick={handlePendingClick}
        isActive={activeFilter === "pending"}
      />
      <StatusSummaryCard
        label="Approved"
        count={approvedCount}
        icon={<CheckCircle size={24} />}
        variant="approved"
        onClick={handleApprovedClick}
        isActive={activeFilter === "approved"}
      />
      <StatusSummaryCard
        label="Hold Files"
        count={holdfileCount}
        icon={<XCircle size={24} />}
        variant="holdfile"
        onClick={handleHoldfileClick}
        isActive={activeFilter === "holdfile"}
      />
    </div>
  );
}
