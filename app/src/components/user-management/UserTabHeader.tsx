import { useCallback } from "react";
import { UsersIcon, UserGroupIcon } from "@/components/icons";
import { StatusSummaryCard } from "@/components/StatusSummaryCard";

export type UserTab = "staff" | "donors";

interface UserTabHeaderProps {
  activeTab: UserTab;
  staffCount: number;
  donorCount: number;
  onTabChange: (tab: UserTab) => void;
}

export function UserTabHeader({
  activeTab,
  staffCount,
  donorCount,
  onTabChange,
}: UserTabHeaderProps) {
  const handleStaffClick = useCallback(
    () => onTabChange("staff"),
    [onTabChange],
  );
  const handleDonorClick = useCallback(
    () => onTabChange("donors"),
    [onTabChange],
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatusSummaryCard
        label="Staff"
        count={staffCount}
        icon={<UsersIcon />}
        variant="all"
        onClick={handleStaffClick}
        isActive={activeTab === "staff"}
      />
      <StatusSummaryCard
        label="Donors"
        count={donorCount}
        icon={<UserGroupIcon />}
        variant="pending"
        onClick={handleDonorClick}
        isActive={activeTab === "donors"}
      />
    </div>
  );
}
