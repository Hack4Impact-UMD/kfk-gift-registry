import { useCallback, useMemo } from "react";
import { Eye, EyeOff } from "lucide-react";
import { UsersIcon } from "@/components/icons";
import { StatusSummaryCard } from "@/components/StatusSummaryCard";
import type { ApprovedProfileTableRow, ChildProfileVisibility } from "./types";

interface StatusSummaryHeaderProps {
  data: Array<ApprovedProfileTableRow>;
  activeFilter: ChildProfileVisibility | null;
  onFilterChange: (status: ChildProfileVisibility | null) => void;
}

export function StatusSummaryHeader({
  data,
  activeFilter,
  onFilterChange,
}: StatusSummaryHeaderProps) {
  const totalCount = data.length;
  const publishedCount = useMemo(
    () => data.filter((row) => row.published).length,
    [data],
  );
  const unpublishedCount = useMemo(
    () => data.filter((row) => !row.published).length,
    [data],
  );

  const handleAllClick = useCallback(
    () => onFilterChange(null),
    [onFilterChange],
  );
  const handlePublishedClick = useCallback(
    () => onFilterChange("published"),
    [onFilterChange],
  );
  const handleUnpublishedClick = useCallback(
    () => onFilterChange("unpublished"),
    [onFilterChange],
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatusSummaryCard
        label="All Profiles"
        count={totalCount}
        icon={<UsersIcon />}
        variant="all"
        onClick={handleAllClick}
        isActive={activeFilter === null}
      />
      <StatusSummaryCard
        label="Published"
        count={publishedCount}
        icon={<Eye size={24} />}
        variant="published"
        onClick={handlePublishedClick}
        isActive={activeFilter === "published"}
      />
      <StatusSummaryCard
        label="Unpublished"
        count={unpublishedCount}
        icon={<EyeOff size={24} />}
        variant="unpublished"
        onClick={handleUnpublishedClick}
        isActive={activeFilter === "unpublished"}
      />
    </div>
  );
}
