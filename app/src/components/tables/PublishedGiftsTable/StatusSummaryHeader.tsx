import { useCallback, useMemo } from "react";
import { Gift, Package, ShoppingBag, Building2, Heart } from "lucide-react";
import { StatusSummaryCard } from "./StatusSummaryCard";
import type { GiftPurchaseStatus, PublishedGiftsTableRow } from "./types";

interface StatusSummaryHeaderProps {
  data: Array<PublishedGiftsTableRow>;
  activeFilter: GiftPurchaseStatus | null;
  onFilterChange: (status: GiftPurchaseStatus | null) => void;
}

export function StatusSummaryHeader({
  data,
  activeFilter,
  onFilterChange,
}: StatusSummaryHeaderProps) {
  const totalCount = data.length;
  const unpurchasedCount = useMemo(
    () => data.filter((row) => row.sponsorType === "unpurchased").length,
    [data],
  );
  const purchasedCount = useMemo(
    () =>
      data.filter(
        (row) =>
          row.sponsorType === "purchased" ||
          row.sponsorType === "purchased_kfk" ||
          row.sponsorType === "purchased_donor",
      ).length,
    [data],
  );
  const purchasedKfkCount = useMemo(
    () => data.filter((row) => row.sponsorType === "purchased_kfk").length,
    [data],
  );
  const purchasedDonorCount = useMemo(
    () => data.filter((row) => row.sponsorType === "purchased_donor").length,
    [data],
  );

  const handleAllClick = useCallback(
    () => onFilterChange(null),
    [onFilterChange],
  );
  const handleUnpurchasedClick = useCallback(
    () => onFilterChange("unpurchased"),
    [onFilterChange],
  );
  const handlePurchasedClick = useCallback(
    () => onFilterChange("purchased"),
    [onFilterChange],
  );
  const handlePurchasedKfkClick = useCallback(
    () => onFilterChange("purchased_kfk"),
    [onFilterChange],
  );
  const handlePurchasedDonorClick = useCallback(
    () => onFilterChange("purchased_donor"),
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
        label="Unpurchased Gifts"
        count={unpurchasedCount}
        icon={<Package size={24} />}
        variant="unpurchased"
        onClick={handleUnpurchasedClick}
        isActive={activeFilter === "unpurchased"}
      />
      <StatusSummaryCard
        label="All Purchased Gifts"
        count={purchasedCount}
        icon={<ShoppingBag size={24} />}
        variant="purchased"
        onClick={handlePurchasedClick}
        isActive={activeFilter === "purchased"}
      />
      <StatusSummaryCard
        label="Purchased by KFK"
        count={purchasedKfkCount}
        icon={<Building2 size={24} />}
        variant="purchased_kfk"
        onClick={handlePurchasedKfkClick}
        isActive={activeFilter === "purchased_kfk"}
      />
      <StatusSummaryCard
        label="Purchased by Donor"
        count={purchasedDonorCount}
        icon={<Heart size={24} />}
        variant="purchased_donor"
        onClick={handlePurchasedDonorClick}
        isActive={activeFilter === "purchased_donor"}
      />
    </div>
  );
}
