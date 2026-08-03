import Ladybug from "@/assets/ladybug-storefront.svg";
import { GiftIcon, UserGroupIcon, UserIcon } from "@/components/icons";
import { StorefrontDriveProgressBar } from "@/components/storefront";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import type { GiftDrive } from "common";
import { Spinner } from "@/components/ui/spinner";

interface StatProps {
  children?: ReactNode;
  startIcon: ReactNode;
}

function StatLabel({ children, startIcon }: StatProps) {
  return (
    <div className="flex gap-2 items-center flex-col md:flex-row text-center md:text-left text-[1.05rem] md:text-[1.2rem]">
      {startIcon}
      <span>{children}</span>
    </div>
  );
}

function useTimeRemaining(endDate: string) {
  const getRemaining = () =>
    DateTime.fromISO(endDate).diffNow(["days", "hours", "minutes", "seconds"]);

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const compute = () =>
      DateTime.fromISO(endDate).diffNow([
        "days",
        "hours",
        "minutes",
        "seconds",
      ]);
    const id = setInterval(() => setRemaining(compute()), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return remaining;
}

interface GiftDriveStatsProps {
  drive: GiftDrive;
  giftsClaimed: number;
  totalGifts: number;
  childrenWithGifts: number;
  totalDonated: number | undefined;
  totalDonatedPending: boolean;
}

export function GiftDriveStats({
  drive,
  giftsClaimed,
  totalGifts,
  childrenWithGifts,
  totalDonated,
  totalDonatedPending,
}: GiftDriveStatsProps) {
  const remaining = useTimeRemaining(drive.endDate);
  const isExpired = remaining.toMillis() <= 0;
  const days = Math.max(0, Math.floor(remaining.days));
  const hours = String(Math.max(0, Math.floor(remaining.hours))).padStart(
    2,
    "0",
  );
  const minutes = String(Math.max(0, Math.floor(remaining.minutes))).padStart(
    2,
    "0",
  );
  const seconds = String(Math.max(0, Math.floor(remaining.seconds))).padStart(
    2,
    "0",
  );

  const timeLabel = isExpired
    ? "Drive has ended"
    : days >= 1
      ? `${days} ${days === 1 ? "Day" : "Days"} Left to Donate!`
      : `${hours}:${minutes}:${seconds} Left to Donate!`;

  const progressPercentage =
    totalGifts > 0 ? Math.floor((giftsClaimed / totalGifts) * 100) : 0;
  const ladybugClampedPosition = Math.min(Math.max(progressPercentage, 3), 97);

  return (
    <div
      className="bg-kfk-blue text-white font-gaegu py-7"
      data-tour="gift-drive-stats"
    >
      <div className="flex flex-col gap-5 w-full max-w-6xl mx-auto px-4">
        <h2 className="text-center text-[1.85rem] font-bold md:text-[2.2rem]">
          {!isExpired && days >= 1 ? (
            <>
              <span className="text-kfk-yellow">{days}</span>{" "}
              <span className="text-white">
                {days === 1 ? "Day" : "Days"} Left to Donate!
              </span>
            </>
          ) : (
            timeLabel
          )}
        </h2>

        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3 text-[1.45rem] font-bold leading-none md:text-[1.7rem]">
            <span className="text-white">Gifts Purchased</span>
            <span className="text-[1rem] font-normal text-white/45 md:text-[1.15rem]">
              {giftsClaimed} of {totalGifts}
            </span>
          </div>

          <StorefrontDriveProgressBar
            progressPercentage={progressPercentage}
            ladybugPosition={ladybugClampedPosition}
            ladybugSrc={Ladybug}
          />
        </div>

        <div className="flex justify-around gap-2 text-[1.15rem] md:text-[1.35rem]">
          <StatLabel startIcon={<GiftIcon className="h-5 w-5" />}>
            <span className="text-kfk-yellow">{giftsClaimed}</span> out of {totalGifts} Gifts Purchased
          </StatLabel>
          <StatLabel startIcon={<UserGroupIcon className="h-5 w-5" />}>
            <span className="text-kfk-yellow">{childrenWithGifts}</span> Children Received Gifts
          </StatLabel>
          <StatLabel startIcon={<UserIcon className="h-5 w-5" />}>
            <span className="text-kfk-yellow">
              {totalDonatedPending ? (
                <Spinner className="inline" />
              ) : totalDonated !== undefined ? (
                totalDonated
              ) : (
                "—"
              )}
            </span>{" "}
            People Donated
          </StatLabel>
        </div>
      </div>
    </div>
  );
}
