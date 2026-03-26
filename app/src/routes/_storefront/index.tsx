import { createFileRoute } from "@tanstack/react-router";
import { GiftDriveStats } from "@/components/storefront/GiftDriveStats";

export const Route = createFileRoute("/_storefront/")({ component: App });

function App() {
  return (
    <div>
      <GiftDriveStats 
        days={22}
        giftsPurchased={876}
        totalGiftsPurchased={1212}
        giftsReceived={165}
        totalDonated={87}
        />
    </div>
  );
}
