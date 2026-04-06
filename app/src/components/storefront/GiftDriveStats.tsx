import Ladybug from "@/assets/ladybug-storefront.svg";
import { StoreFrontProgress } from "@/components/ui/progress";
import { GiftIcon, UserGroupIcon, UserIcon } from "@/components/icons";
import type { ReactNode } from "react";

interface StatProps {
  children?: ReactNode;
  startIcon: ReactNode;
}

function StatLabel({ children, startIcon }: StatProps) {
  return (
    <div className="flex gap-2 items-center flex-col md:flex-row text-center md:text-left">
      {startIcon}
      <span>{children}</span>
    </div>
  );
}

interface GiftDriveStatsProps {
  days: number;
  giftsPurchased: number;
  totalGiftsPurchased: number;
  giftsReceived: number;
  totalDonated: number;
}

export function GiftDriveStats({
  days,
  giftsPurchased,
  totalGiftsPurchased,
  giftsReceived,
  totalDonated,
}: GiftDriveStatsProps) {
  const progressPercentage =
    totalGiftsPurchased > 0
      ? Math.floor((giftsPurchased / totalGiftsPurchased) * 100)
      : 0;
  const ladybugClampedPosition = Math.min(Math.max(progressPercentage, 2), 98);

  return (
    <div className="bg-kfk-blue text-white font-gaegu py-7">
      <div className="flex flex-col gap-5 w-full max-w-6xl mx-auto px-4">
        <h2 className="text-center text-2xl font-bold">
          {days} Days Left to Donate!
        </h2>
        <div className="relative w-full p-2 bg-[#FFF8C2] rounded-full">
          <StoreFrontProgress
            value={progressPercentage}
            className="[&>*]:bg-kfk-yellow [&>*]:bg-repeat-x h-6 bg-transparent"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full p-1 text-white"
            style={{ left: `${ladybugClampedPosition}%` }}
          >
            <img src={Ladybug} alt="ladybug" className="w-10 h-10 max-w-none" />
          </div>
        </div>

        <div className="flex justify-around text-xl gap-2">
          <StatLabel startIcon={<GiftIcon className="h-5 w-5" />}>
            <span className="text-kfk-yellow">{giftsPurchased}</span> out of{" "}
            {totalGiftsPurchased} Gifts Purchased
          </StatLabel>
          <StatLabel startIcon={<UserGroupIcon className="h-5 w-5" />}>
            <span className="text-kfk-yellow">{giftsReceived}</span> Children
            Received Gifts
          </StatLabel>
          <StatLabel startIcon={<UserIcon className="h-5 w-5" />}>
            <span className="text-kfk-yellow">{totalDonated}</span> People
            Donated
          </StatLabel>
        </div>
      </div>
    </div>
  );
}
