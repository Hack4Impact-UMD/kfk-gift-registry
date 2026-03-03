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
};

export type Child = {
  id: string;
  name: string;
  profileImage?: string;
  gifts: Gift[];
};

export type Family = {
  token: string;
  parentName: string;
  email: string;
  diagnosis: string;
  children: Child[];
};

export const mockFamily: Family = {
  token: "abc123",
  parentName: "Sarah Johnson",
  email: "sarah@example.com",
  diagnosis: "Leukemia",
  children: [
    {
      id: "child-1",
      name: "John R.",
      profileImage: undefined,
      gifts: [
        {
          id: "gift-1",
          name: "Taco Cat Goat Cheese Pizza Card Game",
          price: 9.95,
          status: "delivered",
        },
        {
          id: "gift-2",
          name: "HUES and CUES - Color Board Game",
          price: 10.56,
          status: "in_transit",
        },
        {
          id: "gift-3",
          name: "Sorry! Classic Board Game",
          price: 8.62,
          status: "claimed",
        },
      ],
    },
    {
      id: "child-2",
      name: "Maya R.",
      profileImage: undefined,
      gifts: [
        {
          id: "gift-4",
          name: "Unicorn Academy Doll",
          price: 24.99,
          status: "received",
        },
      ],
    },
    {
      id: "child-3",
      name: "Lily M.",
      profileImage: undefined,
      gifts: [
        {
          id: "gift-5",
          name: "Mermaid Doll with Pink Hair",
          price: 19.99,
          status: "delivered",
        },
        {
          id: "gift-6",
          name: "Kids Mini Play Kitchen",
          price: 39.99,
          status: "delivered",
        },
      ],
    },
  ],
};