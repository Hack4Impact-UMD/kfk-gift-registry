import heroScene from "@/assets/off-season/offseason-hero-scene.svg";
import childrenReceivedBackground from "@/assets/off-season/stats-children-received.svg";
import donationAmountBackground from "@/assets/off-season/stats-donation-amount.svg";
import giftsPurchasedBackground from "@/assets/off-season/stats-gifts-purchased.svg";
import peopleDonatedBackground from "@/assets/off-season/stats-people-donated.svg";
import { useAllGiftDrives } from "@/hooks/queries/useAllGiftDrives";
import { useStorefrontChildProfiles } from "@/hooks/queries/useStorefrontChildProfiles";
import { useStorefrontUniqueDonors } from "@/hooks/queries/useStorefrontUniqueDonors";
import {
  formatISODate,
  getLatestCompletedDrive,
  getNextScheduledDrive,
} from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import type { GiftStatus } from "common";
import { useMemo } from "react";
import { ArrowDown } from "lucide-react";

const purchasedGiftStatuses = new Set<GiftStatus>([
  "PURCHASED",
  "DELIVERED",
  "RECEIVED",
]);

type StatCardProps = {
  backgroundSrc: string;
  value: string;
  label: string;
  className?: string;
  contentClassName?: string;
};

function StatCard({
  backgroundSrc,
  value,
  label,
  className,
  contentClassName,
}: StatCardProps) {
  return (
    <div className={className}>
      <div className="relative isolate overflow-hidden rounded-xl">
        <img
          src={backgroundSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className={`relative z-10 flex min-h-28 flex-col justify-center gap-1 px-6 py-5 font-gaegu text-black sm:min-h-32 sm:px-8 ${contentClassName ?? ""}`}
        >
          <p className="text-2xl leading-tight font-bold sm:text-3xl">
            {value}
          </p>
          <p className="text-lg leading-tight sm:text-2xl">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function OffSeasonScreen() {
  const {
    data: drives,
    isPending: isDrivesPending,
    isError: isDrivesError,
  } = useAllGiftDrives();

  const latestCompletedDrive = useMemo(
    () => (drives ? getLatestCompletedDrive(drives) : undefined),
    [drives],
  );
  const nextScheduledDrive = useMemo(
    () => (drives ? getNextScheduledDrive(drives) : undefined),
    [drives],
  );

  const {
    data: recentDriveChildren,
    isPending: isRecentDriveChildrenPending,
    isError: isRecentDriveChildrenError,
  } = useStorefrontChildProfiles(latestCompletedDrive?.id);
  const {
    data: recentDriveUniqueDonors,
    isPending: isRecentDriveUniqueDonorsPending,
    isError: isRecentDriveUniqueDonorsError,
  } = useStorefrontUniqueDonors(latestCompletedDrive?.id);

  const recentDriveStats = useMemo(() => {
    if (!recentDriveChildren) {
      return {
        totalPurchasedGifts: 0,
        childrenReceivedGifts: 0,
        donationAmount: 0,
      };
    }

    let totalPurchasedGifts = 0;
    let childrenReceivedGifts = 0;
    let donationAmount = 0;

    for (const child of recentDriveChildren) {
      let childPurchasedGiftCount = 0;

      for (const gift of child.gifts) {
        if (!purchasedGiftStatuses.has(gift.status)) {
          continue;
        }

        childPurchasedGiftCount += 1;
        totalPurchasedGifts += 1;
        donationAmount += gift.listedPrice ?? 0;
      }

      if (childPurchasedGiftCount > 0) {
        childrenReceivedGifts += 1;
      }
    }

    return {
      totalPurchasedGifts,
      childrenReceivedGifts,
      donationAmount,
    };
  }, [recentDriveChildren]);

  if (isDrivesPending) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isDrivesError) {
    return (
      <div className="flex min-h-96 items-center justify-center px-4 text-center">
        <p className="font-gaegu text-xl text-kfk-red">
          Error loading gift drive information. Please try again later.
        </p>
      </div>
    );
  }

  const introCopy = nextScheduledDrive
    ? `The gift drive is currently not in session, but our next one begins ${formatISODate(nextScheduledDrive.startDate)} for the ${nextScheduledDrive.cycle} drive.`
    : "The gift drive is currently not in session. Check back soon for our next annual drive.";

  const showStats =
    !!latestCompletedDrive &&
    !isRecentDriveChildrenError &&
    !isRecentDriveUniqueDonorsError;

  return (
    <div className="bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:gap-10 lg:py-12">
        <section className="rounded-4xl bg-gradient-to-br from-white via-kfk-yellow/10 to-kfk-yellow/20 px-5 py-8 shadow-sm ring-1 ring-black/5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div
                aria-hidden="true"
                className="pointer-events-none mx-auto min-h-80 w-full max-w-xl select-none bg-contain bg-center bg-no-repeat lg:min-h-96 lg:max-w-none"
                style={{ backgroundImage: `url(${heroScene})` }}
              />
            </div>

            <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:items-start lg:text-left">
              <h1 className="font-gaegu text-4xl leading-none text-black sm:text-5xl">
                Hey there!
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-black sm:text-base">
                Thank you for being part of our annual gift drive. {introCopy}
              </p>
              {showStats ? (
                <>
                  <p className="mt-6 max-w-sm font-gaegu text-xl leading-7 text-black sm:text-2xl">
                    Before you go, check out our most recent gift drive stats
                    below.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById("recent-drive-stats")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-black text-black transition-colors hover:bg-black hover:text-white"
                    aria-label="Jump to recent drive stats"
                  >
                    <ArrowDown className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </section>

        {showStats ? (
          <section
            id="recent-drive-stats"
            className="space-y-6 border-t-4 border-dashed border-black pt-8"
          >
            <div className="text-center">
              <h2 className="font-gaegu text-3xl leading-tight text-black sm:text-4xl">
                {latestCompletedDrive.cycle} Gift Drive Stats
              </h2>
            </div>

            {isRecentDriveChildrenPending ||
            isRecentDriveUniqueDonorsPending ? (
              <div className="flex min-h-52 items-center justify-center rounded-3xl bg-kfk-yellow/10">
                <Spinner />
              </div>
            ) : (
              <div className="grid gap-4">
                <StatCard
                  backgroundSrc={giftsPurchasedBackground}
                  value={recentDriveStats.totalPurchasedGifts.toLocaleString(
                    "en-US",
                  )}
                  label="Gifts Purchased"
                />
                <StatCard
                  backgroundSrc={childrenReceivedBackground}
                  value={recentDriveStats.childrenReceivedGifts.toLocaleString(
                    "en-US",
                  )}
                  label="Children Received Gifts"
                  contentClassName="items-start text-left md:items-end md:text-right"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <StatCard
                    backgroundSrc={donationAmountBackground}
                    value={new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(recentDriveStats.donationAmount)}
                    label="Donation Amount"
                  />
                  <StatCard
                    backgroundSrc={peopleDonatedBackground}
                    value={(recentDriveUniqueDonors ?? 0).toLocaleString(
                      "en-US",
                    )}
                    label="People Donated"
                    contentClassName="items-center text-center"
                  />
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
