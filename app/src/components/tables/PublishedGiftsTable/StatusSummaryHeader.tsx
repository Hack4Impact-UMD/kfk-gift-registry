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
  const unpurchasedCount = data.filter(
    (row) => row.sponsorType === "unpurchased"
  ).length;
  const purchasedCount = data.filter(
    (row) =>
      row.sponsorType === "purchased" ||
      row.sponsorType === "purchased_kfk" ||
      row.sponsorType === "purchased_donor"
  ).length;
  const purchasedKfkCount = data.filter(
    (row) => row.sponsorType === "purchased_kfk"
  ).length;
  const purchasedDonorCount = data.filter(
    (row) => row.sponsorType === "purchased_donor"
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatusSummaryCard
        label="All Gifts"
        count={totalCount}
        variant="all"
        onClick={() => onFilterChange(null)}
        isActive={activeFilter === null}
      />
      <StatusSummaryCard
        label="Unpurchased Gifts"
        count={unpurchasedCount}
        variant="unpurchased"
        onClick={() => onFilterChange("unpurchased")}
        isActive={activeFilter === "unpurchased"}
      />
      <StatusSummaryCard
        label="All Purchased Gifts"
        count={purchasedCount}
        variant="purchased"
        onClick={() => onFilterChange("purchased")}
        isActive={activeFilter === "purchased"}
      />
      <StatusSummaryCard
        label="Purchased by KFK"
        count={purchasedKfkCount}
        variant="purchased_kfk"
        onClick={() => onFilterChange("purchased_kfk")}
        isActive={activeFilter === "purchased_kfk"}
      />
      <StatusSummaryCard
        label="Purchased by Donor"
        count={purchasedDonorCount}
        variant="purchased_donor"
        onClick={() => onFilterChange("purchased_donor")}
        isActive={activeFilter === "purchased_donor"}
      />
    </div>
  );
}
