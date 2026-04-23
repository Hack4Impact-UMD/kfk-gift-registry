import { createFileRoute } from "@tanstack/react-router";
import { PublishedGiftsTable } from "@/components/tables/PublishedGiftsTable";
import type { PublishedGiftsTableRow } from "@/components/tables/PublishedGiftsTable";

export const Route = createFileRoute("/_authenticated/staff/gifts")({
  component: RouteComponent,
});

// Sample data - replace with actual data from database
const sampleGiftData: Array<PublishedGiftsTableRow> = [
  {
    id: "gift-001",
    giftName: "LEGO Star Wars Set",
    giftStatus: "AVAILABLE",
    sponsorType: "unpurchased",
    sponsorName: undefined,
    sponsorEmail: undefined,
    dateOfFulfillment: undefined,
    productUrl: "https://www.example.com/lego-star-wars",
  },
  {
    id: "gift-002",
    giftName: "Nintendo Switch Game",
    giftStatus: "claimed",
    sponsorType: "purchased_donor",
    sponsorName: "John Smith",
    sponsorEmail: "john@example.com",
    dateOfFulfillment: "2024-12-15",
    productUrl: "https://www.example.com/switch-game",
  },
  {
    id: "gift-003",
    giftName: "Art Supplies Bundle",
    giftStatus: "purchased",
    sponsorType: "purchased_kfk",
    sponsorName: "KFK Organization",
    sponsorEmail: "contact@kfk.org",
    dateOfFulfillment: "2024-12-10",
    productUrl: "https://www.example.com/art-supplies",
  },
  {
    id: "gift-004",
    giftName: "Books Collection",
    giftStatus: "delivered",
    sponsorType: "purchased_donor",
    sponsorName: "Sarah Johnson",
    sponsorEmail: "sarah@example.com",
    dateOfFulfillment: "2024-12-05",
    productUrl: "https://www.example.com/books",
  },
  {
    id: "gift-005",
    giftName: "Bicycle",
    giftStatus: "delivered",
    sponsorType: "purchased_kfk",
    sponsorName: "KFK Organization",
    sponsorEmail: "contact@kfk.org",
    dateOfFulfillment: "2024-11-28",
    productUrl: "https://www.example.com/bicycle",
  },
  {
    id: "gift-006",
    giftName: "Basketball",
    giftStatus: "unclaimed",
    sponsorType: "unpurchased",
    sponsorName: undefined,
    sponsorEmail: undefined,
    dateOfFulfillment: undefined,
    productUrl: "https://www.example.com/basketball",
  },
  {
    id: "gift-007",
    giftName: "Laptop Stand",
    giftStatus: "claimed",
    sponsorType: "purchased_donor",
    sponsorName: "Mike Wilson",
    sponsorEmail: "mike@example.com",
    dateOfFulfillment: "2024-12-12",
    productUrl: "https://www.example.com/laptop-stand",
  },
  {
    id: "gift-008",
    giftName: "Headphones",
    giftStatus: "purchased",
    sponsorType: "purchased_kfk",
    sponsorName: "KFK Organization",
    sponsorEmail: "contact@kfk.org",
    dateOfFulfillment: "2024-12-08",
    productUrl: "https://www.example.com/headphones",
  },
];

function RouteComponent() {
  return (
    <div className="w-full p-6">
      <div className="space-y-6">
        <PublishedGiftsTable data={sampleGiftData} rowsPerPage={10} />
      </div>
    </div>
  );
}
