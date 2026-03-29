export type CartGift = {
  id: string;
  childId: string;
  childName: string;
  giftName: string;
  price: number;
  status: "unordered" | "claimed" | "in_transit" | "delivered" | "received";
  trackingNumber?: number;
  dateDelivered?: string;
};

export type CartFamily = {
  familyId: string;
  parentLastName: string;
  gifts: Array<CartGift>;
};

export const mockCartData: Array<CartFamily> = [
  {
    familyId: "family-1",
    parentLastName: "Johnson",
    gifts: [
      {
        id: "gift-1",
        childId: "child-1",
        childName: "John R.",
        giftName: "Taco Cat Goat Cheese Pizza Card Game",
        price: 9.95,
        status: "delivered",
        trackingNumber: 123456789,
        dateDelivered: "2026-10-22",
      },
      {
        id: "gift-2",
        childId: "child-1",
        childName: "John R.",
        giftName: "HUES and CUES - Color Board Game",
        price: 10.56,
        status: "in_transit",
        trackingNumber: 987654321,
      },
      {
        id: "gift-4",
        childId: "child-2",
        childName: "Maya R.",
        giftName: "Unicorn Academy Doll",
        price: 24.99,
        status: "received",
        trackingNumber: 564738291,
        dateDelivered: "2026-10-20",
      },
      {
        id: "gift-5",
        childId: "child-3",
        childName: "Lily M.",
        giftName: "Mermaid Doll with Pink Hair",
        price: 19.99,
        status: "delivered",
        trackingNumber: 564738291,
        dateDelivered: "2026-10-20",
      },
    ],
  },
  {
    familyId: "family-2",
    parentLastName: "Smith",
    gifts: [
      {
        id: "gift-9",
        childId: "child-6",
        childName: "Emma S.",
        giftName: "Art Supply Set",
        price: 29.99,
        status: "unordered",
      },
      {
        id: "gift-10",
        childId: "child-7",
        childName: "Oliver S.",
        giftName: "LEGO Space Set",
        price: 49.99,
        status: "claimed",
      },
    ],
  },
];
