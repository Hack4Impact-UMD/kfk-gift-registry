import { useCallback, useMemo } from "react";
import { Gift, Package, ShoppingBag, Building2, Heart } from "lucide-react";
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
  const unclaimedCount = useMemo(
    () => data.filter((row) => row.sponsorType === "unclaimed").length,
    [data],
  );
  const claimedCount = useMemo(
    () =>
      data.filter(
        (row) =>
          row.sponsorType === "claimed_kfk" ||
          row.sponsorType === "claimed_donor" ||
          row.sponsorType === "claimed",
      ).length,
    [data],
  );
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
  const handleUnclaimedClick = useCallback(
    () => onFilterChange("unclaimed"),
    [onFilterChange],
  );
  const handleClaimedClick = useCallback(
    () => onFilterChange("claimed"),
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatusSummaryCard
        label="All Gifts"
        count={totalCount}
        icon={<Gift size={24} />}
        variant="all"
        onClick={handleAllClick}
        isActive={activeFilter === null}
      />
      <StatusSummaryCard
        label="Unclaimed Gifts"
        count={unclaimedCount}
        icon={<Package size={24} />}
        variant="unclaimed"
        onClick={handleUnclaimedClick}
        isActive={activeFilter === "unclaimed"}
      />
      <StatusSummaryCard
        label="All Claimed Gifts"
        count={claimedCount}
        icon={<ShoppingBag size={24} />}
        variant="claimed"
        onClick={handleClaimedClick}
        isActive={activeFilter === "claimed"}
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
