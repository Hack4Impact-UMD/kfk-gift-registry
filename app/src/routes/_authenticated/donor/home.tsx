import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Gift } from "lucide-react";
import DefaultProfile from "@/assets/default-profile-photo.png";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { useDonorCommittedChildren } from "@/hooks/queries/useDonorCommittedChildren";
import { queries } from "@/queries";
import { cn } from "@/lib/utils";
import RedGift from "@/assets/red-gift.png";

export const Route = createFileRoute("/_authenticated/donor/home")({
  beforeLoad: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      queries.donor.home(context.currentDrive?.id ?? ""),
    );
  },
  head: () => ({
    meta: [
      { title: "Dashboard - Donor" },
      {
        name: "description",
        content: "View your committed gifts and manage your donations",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { auth, currentDrive } = Route.useRouteContext();
  const {
    data: committedChildren,
    isPending,
    isError,
  } = useDonorCommittedChildren(currentDrive?.id ?? "");

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Spinner />
      </div>
    );
  }

  const displayName = auth.authUser.displayName ?? "Unnamed User";

  if (isError) {
    return (
      <div className="bg-[#F5F7FB] px-4 py-6">
        <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6 md:max-w-3xl">
          <WelcomeBanner displayName={displayName} />
          <Card className="rounded-[24px] border border-[#E5E7EB] p-8 text-center text-[#4B5563] shadow-sm">
            Unable to load your committed gifts. Please try again.
          </Card>
        </div>
      </div>
    );
  }

  const childrenWithFallbackPhotos = (committedChildren ?? []).map((child) => ({
    ...child,
    photoUrl: child.photoUrl || DefaultProfile,
  }));

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-6">
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6 md:max-w-[760px]">
        <WelcomeBanner displayName={displayName} />

        <section>
          <h2 className="text-center font-gaegu text-[34px] font-bold text-[#173B8F] md:text-[42px]">
            Gift Commitments
          </h2>
        </section>

        <div className="flex flex-col gap-4">
          {childrenWithFallbackPhotos.length > 0 ? (
            childrenWithFallbackPhotos.map((child) => (
              <CommitmentCard key={child.id} child={child} />
            ))
          ) : (
            <Card className="rounded-[24px] border border-[#E5E7EB] p-8 text-center text-[#4B5563] shadow-sm">
              You have not claimed any gifts yet.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

type ChildCardProps = {
  child: NonNullable<ReturnType<typeof useDonorCommittedChildren>["data"]>[number];
};

function WelcomeBanner({ displayName }: { displayName: string }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-[#173FB6] px-5 py-5 text-white shadow-[0_8px_24px_rgba(23,63,182,0.22)] md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute left-10 top-[-10px] h-16 w-16 rounded-full bg-[#4D7CFE]" />
        <div className="absolute left-28 top-8 h-20 w-20 rounded-full bg-[#4D7CFE]" />
        <div className="absolute right-20 top-2 h-16 w-16 rounded-full bg-[#4D7CFE]" />
        <div className="absolute right-6 bottom-4 h-14 w-14 rounded-full bg-[#4D7CFE]" />
      </div>

      <div className="relative flex items-center justify-between gap-4 md:gap-6">
        <div className="min-w-0 max-w-[280px] md:max-w-[420px]">
          <h1 className="font-gaegu text-[28px] font-bold leading-[1.15] tracking-[0.02em] text-white md:max-w-[360px] md:text-[34px]">
            Welcome {displayName}!
          </h1>
          <p className="mt-3 max-w-[280px] text-[16px] italic leading-6 text-white/95 md:max-w-[420px] md:text-[18px] md:leading-8">
            Your Contribution Makes a Difference. Thank You for your support!
          </p>
        </div>

        <div className="flex shrink-0 justify-center md:pr-4">
          <img src={RedGift} alt="Gift" className="w-24 md:w-28" />
        </div>
      </div>
    </div>
  );
}

function CommitmentCard({ child }: ChildCardProps) {
  const visibleGifts = child.gifts.slice(0, 3);

  return (
    <Card className="rounded-none border-x-0 border-b border-t border-[#E5E7EB] bg-white px-4 py-4 shadow-none md:rounded-[24px] md:border md:px-5 md:py-5 md:shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={child.photoUrl}
          alt={`${child.firstName} ${child.lastName}`.trim()}
          className="h-[54px] w-[54px] shrink-0 rounded-full object-cover ring-2 ring-[#8BC34A]"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="font-gaegu text-[28px] font-bold leading-none text-[#1F2937]">
              {`${child.firstName} ${child.lastName}`.trim()}
            </h3>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-none",
                child.category === "Warrior"
                  ? "bg-[#FFF1B8] text-[#8A5A00]"
                  : "bg-[#D4EAFF] text-[#1D4ED8]",
              )}
            >
              {child.category === "Supersib" ? "Super Sib" : child.category}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {visibleGifts.map((gift) => (
              <div key={gift.id} className="flex items-center gap-3">
                <Gift className="size-4 shrink-0 text-[#1D4ED8]" strokeWidth={2.2} />
                <div className="min-w-0 flex flex-1 items-center gap-2">
                  <p className="truncate text-[15px] text-[#1F2937]">{gift.title}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-[12px] font-medium leading-none",
                      gift.status === "CLAIMED"
                        ? "bg-[#FEF3C7] text-[#A16207]"
                        : gift.status === "PURCHASED"
                          ? "bg-[#FEE2E2] text-[#EF4444]"
                          : gift.status === "DELIVERED" || gift.status === "RECEIVED"
                            ? "bg-[#DCFCE7] text-[#2E7D32]"
                            : "bg-[#E5E7EB] text-[#4B5563]",
                    )}
                  >
                    {getGiftStatusLabel(gift.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <Link
              to="/donor/home"
              hash={child.id}
              className="inline-flex items-center gap-1 font-gaegu text-[24px] font-bold text-[#173B8F]"
            >
              <span>View Actions</span>
              <ChevronRight className="size-5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function getGiftStatusLabel(status: string) {
  switch (status) {
    case "CLAIMED":
      return "Action Request";
    case "PURCHASED":
      return "Awaiting Purchase";
    case "DELIVERED":
    case "RECEIVED":
      return "Delivered";
    default:
      return status;
  }
}
