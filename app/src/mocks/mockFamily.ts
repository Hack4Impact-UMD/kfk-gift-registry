export type GiftStatus =
  | "unordered"
  | "claimed"
  | "in_transit"
  | "delivered"
  | "received";

export type Gift = {
  id: string;
  name: string;
  price: number;
  status: GiftStatus;
  trackingNumber?: number;
  dateDelivered?: string;
  dateReceived?: string;
};

export type Child = {
  id: string;
  name: string;
  label: string;
  color: string;
  profileImage?: string;
  gifts: Gift[];
};

export type Family = {
  token: string;
  parentName: string;
  email: string;
  familyName: string;
  diagnosis: string;
  children: Child[];
};

export const mockFamily: Family = {
  token: "abc123",
  parentName: "Sarah Johnson",
  email: "sarah@example.com",
  familyName: "Dolphin",
  diagnosis: "Leukemia",
  children: [
    {
      id: "child-1",
      name: "John R.",
      label: "Warrior",
      color: "kfk-red",
      profileImage: undefined,
      gifts: [
        {
          id: "gift-1",
          name: "Taco Cat Goat Cheese Pizza Card Game",
          price: 9.95,
          status: "delivered",
          trackingNumber: 123456789,
          dateDelivered: "2026-10-22",
        },
        {
          id: "gift-2",
          name: "HUES and CUES - Color Board Game",
          price: 10.56,
          status: "in_transit",
          trackingNumber: 987654321,
        },
        {
          id: "gift-3",
          name: "Sorry! Classic Board Game",
          price: 8.62,
          status: "claimed",
          trackingNumber: 294839102,
        },
      ],
    },
    {
      id: "child-2",
      name: "Maya R.",
      label: "SuperSib",
      color: "kfk-blue",
      profileImage: undefined,
      gifts: [
        {
          id: "gift-4",
          name: "Unicorn Academy Doll",
          price: 24.99,
          status: "received",
          trackingNumber: 564738291,
          dateDelivered: "2026-10-20",
          dateReceived: "2026-10-23",
        },
      ],
    },
    {
      id: "child-3",
      name: "Lily M.",
      label: "SuperSib",
      color: "kfk-green",
      profileImage: undefined,
      gifts: [
        {
          id: "gift-5",
          name: "Mermaid Doll with Pink Hair",
          price: 19.99,
          status: "delivered",
          trackingNumber: 564738291,
          dateDelivered: "2026-10-20",
        },
        {
          id: "gift-6",
          name: "Kids Mini Play Kitchen",
          price: 39.99,
          status: "delivered",
          trackingNumber: 564738291,
          dateDelivered: "2026-10-20",
        },
      ],
    },
    {
      id: "child-4",
      name: "Ronald R.",
      label: "SuperSib",
      color: "kfk-red",
      profileImage: undefined,
      gifts: [
        {
          id: "gift-7",
          name: "Truck Toy Set",
          price: 19.99,
          status: "unordered",
        },
      ],
    },
    {
      id: "child-5",
      name: "Luna R.",
      label: "SuperSib",
      color: "kfk-blue",
      profileImage: undefined,
      gifts: [
        {
          id: "gift-8",
          name: "Volleyball",
          price: 15.99,
          status: "received",
          trackingNumber: 564738291,
          dateDelivered: "2026-11-05",
          dateReceived: "2026-11-10",
        },
      ],
    },
  ],
};