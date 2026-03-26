import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StorefrontNavbar } from "@/components/storefront/StorefrontNavbar";
import { GiftDriveStats } from "@/components/storefront/GiftDriveStats";

export const Route = createFileRoute("/_storefront")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full h-full">
      <StorefrontNavbar />
      <GiftDriveStats 
        days={22}
        giftsPurchased={876}
        totalGiftsPurchased={1212}
        giftsReceived={165}
        totalDonated={87}
        />
      <Outlet />
    </div>
  );
}
