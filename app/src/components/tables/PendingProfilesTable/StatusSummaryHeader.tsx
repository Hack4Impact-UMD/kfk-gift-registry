import { Clock, CheckCircle, XCircle } from "lucide-react";
import { UsersIcon } from "@/components/icons";
import { StatusSummaryCard } from "./StatusSummaryCard";
import type { PendingProfileTableRow } from "./types";

interface StatusSummaryHeaderProps {
  data: Array<PendingProfileTableRow>;
  activeFilter: string | null;
  onFilterChange: (status: string | null) => void;
}

export function StatusSummaryHeader({
  data,
  activeFilter,
  onFilterChange,
}: StatusSummaryHeaderProps) {
  const totalCount = data.length;
  const pendingCount = data.filter((row) => row.status === "pending").length;
  const approvedCount = data.filter((row) => row.status === "approved").length;
  const holdfileCount = data.filter((row) => row.status === "holdfile").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusSummaryCard
        label="All Profiles"
        count={totalCount}
        icon={<UsersIcon />}
        variant="all"
        onClick={() => onFilterChange(null)}
        isActive={activeFilter === null}
      />
      <StatusSummaryCard
        label="Pending Review"
        count={pendingCount}
        icon={<Clock size={24} />}
        variant="pending"
        onClick={() => onFilterChange("pending")}
        isActive={activeFilter === "pending"}
      />
      <StatusSummaryCard
        label="Approved"
        count={approvedCount}
        icon={<CheckCircle size={24} />}
        variant="approved"
        onClick={() => onFilterChange("approved")}
        isActive={activeFilter === "approved"}
      />
      <StatusSummaryCard
        label="Hold Files"
        count={holdfileCount}
        icon={<XCircle size={24} />}
        variant="holdfile"
        onClick={() => onFilterChange("holdfile")}
        isActive={activeFilter === "holdfile"}
      />
    </div>
  );
}
