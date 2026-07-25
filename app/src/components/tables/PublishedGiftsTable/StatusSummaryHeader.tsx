import { useCallback, useMemo } from "react";
import { Gift, Building2, Heart } from "lucide-react";
import { StatusSummaryCard } from "./StatusSummaryCard";
import type { GiftClaimStatus, PublishedGiftsTableRow } from "./types";

interface StatusSummaryHeaderProps {
  data: Array<PublishedGiftsTableRow>;
  activeFilter: GiftClaimStatus | null;
  onFilterChange: (status: GiftClaimStatus | null) => void;
}

export function StatusSummaryHeader({
  data,
  activeFilter,
  onFilterChange,
}: StatusSummaryHeaderProps) {
  const totalCount = data.length;
  const claimedKfkCount = useMemo(
    () => data.filter((row) => row.sponsorType === "claimed_kfk").length,
    [data],
  );
  const claimedDonorCount = useMemo(
    () => data.filter((row) => row.sponsorType === "claimed_donor").length,
    [data],
  );

  const handleAllClick = useCallback(
    () => onFilterChange(null),
    [onFilterChange],
  );
  const handleClaimedKfkClick = useCallback(
    () => onFilterChange("claimed_kfk"),
    [onFilterChange],
  );
  const handleClaimedDonorClick = useCallback(
    () => onFilterChange("claimed_donor"),
    [onFilterChange],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatusSummaryCard
        label="All Gifts"
        count={totalCount}
        icon={<Gift size={24} />}
        variant="all"
        onClick={handleAllClick}
        isActive={activeFilter === null}
      />
      <StatusSummaryCard
        label="Claimed by KFK"
        count={claimedKfkCount}
        icon={<Building2 size={24} />}
        variant="claimed_kfk"
        onClick={handleClaimedKfkClick}
        isActive={activeFilter === "claimed_kfk"}
      />
      <StatusSummaryCard
        label="Claimed by Donor"
        count={claimedDonorCount}
        icon={<Heart size={24} />}
        variant="claimed_donor"
        onClick={handleClaimedDonorClick}
        isActive={activeFilter === "claimed_donor"}
      />
    </div>
  );
}
