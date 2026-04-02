import type { Gift } from "common";

export type CartGift = Gift & {
  childName: string;
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
        familyId: "family-1",
        giftDrive: "annual-gift-drive",
        childName: "John R.",
        title: "Taco Cat Goat Cheese Pizza Card Game",
        productUrl:
          "https://www.amazon.com/Taco-Cat-Goat-Cheese-Pizza/dp/B07JZTBL5M",
        listedPrice: 9.95,
        status: "AVAILABLE",
        createdAt: "2026-01-01T00:00:00.000Z",
        backup: false,
        active: true,
      },
      {
        id: "gift-2",
        childId: "child-1",
        familyId: "family-1",
        giftDrive: "annual-gift-drive",
        childName: "John R.",
        title: "HUES and CUES - Color Board Game",
        productUrl:
          "https://www.amazon.com/Hues-Cues-Award-Winning-Vibrant-Guessing/dp/B083K4V8TK",
        listedPrice: 10.56,
        status: "AVAILABLE",
        createdAt: "2026-01-01T00:00:00.000Z",
        backup: false,
        active: true,
      },
      {
        id: "gift-4",
        childId: "child-2",
        familyId: "family-1",
        giftDrive: "annual-gift-drive",
        childName: "Maya R.",
        title: "Unicorn Academy Doll",
        productUrl:
          "https://www.amazon.com/Spin-Master-Unicorn-Academy-Isabel/dp/B0BSJGZS7P",
        listedPrice: 24.99,
        status: "AVAILABLE",
        createdAt: "2026-01-01T00:00:00.000Z",
        backup: false,
        active: true,
      },
      {
        id: "gift-5",
        childId: "child-3",
        familyId: "family-1",
        giftDrive: "annual-gift-drive",
        childName: "Lily M.",
        title: "Mermaid Doll with Pink Hair",
        productUrl:
          "https://www.amazon.com/Mattel-Mermaid-Hair-Adventure-Doll/dp/B0CBNNVQ19",
        listedPrice: 19.99,
        status: "AVAILABLE",
        createdAt: "2026-01-01T00:00:00.000Z",
        backup: false,
        active: true,
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
        familyId: "family-2",
        giftDrive: "annual-gift-drive",
        childName: "Emma S.",
        title: "Art Supply Set",
        productUrl:
          "https://www.amazon.com/Pentel-Arts-Pastel-Assorted-Colors/dp/B001E63EKW",
        listedPrice: 29.99,
        status: "AVAILABLE",
        createdAt: "2026-01-01T00:00:00.000Z",
        backup: false,
        active: true,
      },
      {
        id: "gift-10",
        childId: "child-7",
        familyId: "family-2",
        giftDrive: "annual-gift-drive",
        childName: "Oliver S.",
        title: "LEGO Space Set",
        productUrl:
          "https://www.amazon.com/LEGO-City-Interstellar-Spaceship-Building/dp/B0CGY27MP8",
        listedPrice: 49.99,
        status: "AVAILABLE",
        createdAt: "2026-01-01T00:00:00.000Z",
        backup: false,
        active: true,
      },
    ],
  },
];
