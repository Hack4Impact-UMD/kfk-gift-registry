import { createFileRoute } from "@tanstack/react-router";
import { GiftDriveStats } from "@/components/storefront/GiftDriveStats";
import { ChildCard, ChildCardData } from "@/components/storefront/ChildCard";

export const Route = createFileRoute("/_storefront/")({
  component: App,
});

function App() {
  const mockChild: ChildCardData = {
    id: "1",
    name: "Ryan Peirce",
    category: "warrior",
    age: 6,
    diagnosis: "Acute lymphoblastic leukemia",
    giftsRequested: 3,
    giftsReceived: 0,
  };

  return (
    <div className="p-4 space-y-6">
      <GiftDriveStats 
        days={22}
        giftsPurchased={876}
        totalGiftsPurchased={1212}
        giftsReceived={165}
        totalDonated={87}
      />

      {/* Child Card Section */}
      <div className="flex gap-4 flex-wrap">
        <ChildCard child={mockChild} />
      </div>
    </div>
  );
}