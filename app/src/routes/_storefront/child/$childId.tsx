import { createFileRoute } from "@tanstack/react-router";
import { ChildInfoCard } from "@/components/storefront/ChildInfoCard";
import type { CarouselCardSibling } from "@/components/storefront/CarouselCards";
import { SiblingsCarousel } from "@/components/storefront/SiblingsCarousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StorefrontChild } from "@/types/storefront";
import { GiftTable } from "@/components/tables/GiftTable/GiftTable";

export const Route = createFileRoute("/_storefront/child/$childId")({
  component: RouteComponent,
});

const MOCK_CHILDREN: Record<string, StorefrontChild> = {
  "1": {
    id: "1",
    name: "Ryan Peirce",
    category: "warrior",
    age: 6,
    diagnosis: "Acute Lymphocytic Leukemia",
    photoUrl: undefined,
    publicBlurb:
      "Lincoln has the biggest heart. He is now a big brother and he cannot get enough of his little brother Gunner. Lincoln enjoys art and crafts. He always wants to learn something new.",
    status: "diagnosed_in_treatment_1yr+",
    gifts: [
      {
        id: "gift-1",
        title: "Taco Cat Goat Cheese Pizza Card Game",
        productUrl:
          "https://www.amazon.com/Taco-Cat-Goat-Cheese-Pizza/dp/B07JZTBL5M",
        listedPrice: 19.95,
        status: "AVAILABLE",
      },
      {
        id: "gift-2",
        title: "HUES and CUES - Color Guessing Board Game",
        productUrl:
          "https://www.amazon.com/Hues-Cues-Award-Winning-Vibrant-Guessing/dp/B083K4V8TK",
        listedPrice: 19.95,
        status: "AVAILABLE",
      },
      {
        id: "gift-3",
        title: "Sorry! Classic Board Game",
        productUrl:
          "https://www.amazon.com/Hasbro-Gaming-A5065-Sorry-Game/dp/B00000DMFW",
        listedPrice: 19.95,
        status: "AVAILABLE",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Christina Anne T. Montgomery",
    category: "super_sib",
    age: 8,
    diagnosis: "Leukemia",
    photoUrl: undefined,
    publicBlurb:
      "Christina is a bright and caring sister who loves to read and play with her siblings.",
    status: "sibling_in_treatment",
    gifts: [
      {
        id: "gift-4",
        title:
          "Art Supply Kit Art Supply KitArt Supply KitArt Supply KitArt Supply KitArt Supply KitArt Supply Kit",
        productUrl:
          "https://www.amazon.com/Pentel-Arts-Pastel-Assorted-Colors/dp/B001E63EKW/ref=sr_1_7?crid=2TN55QEC2C55Z&dib=eyJ2IjoiMSJ9.9dMqDKZgu1zEyiyUnCopEuT-XHbMC521m8grtaYdIDCBhJSNX13atUZJ-4nM7jCjs4Szaicy93F8JPf9fLP1oiiFAPD7z7y0nS52tfbpeoYDf35yWtpr9cLmzOvzsU17a9REIF2iK75G2X8uy8UBsk_twc-z8X6kKE55Ley_e4aYNV7-eNP8D_HnUfG-M_LRcnEj5ug5yjgi0ZaUh1Prkle366XJlbwlRfvUQBZYbMtfqugHXqA4B_bIGmxyCPuhJpTUweL-VOUEuTCP8PaX_iHOHKSYUJvcBGhoY2eNLm0.F_SUrjBjJlfs94Q_SKMu2jcUoaX4sxV5irQokjegVPU&dib_tag=se&keywords=art+supplies&qid=1774550253&sprefix=art+sup%2Caps%2C151&sr=8-7",
        listedPrice: 24.99,
        status: "AVAILABLE",
      },
      {
        id: "gift-5",
        title: "Art Supply Kit",
        productUrl:
          "https://www.amazon.com/Pentel-Arts-Pastel-Assorted-Colors/dp/B001E63EKW/ref=sr_1_7?crid=2TN55QEC2C55Z&dib=eyJ2IjoiMSJ9.9dMqDKZgu1zEyiyUnCopEuT-XHbMC521m8grtaYdIDCBhJSNX13atUZJ-4nM7jCjs4Szaicy93F8JPf9fLP1oiiFAPD7z7y0nS52tfbpeoYDf35yWtpr9cLmzOvzsU17a9REIF2iK75G2X8uy8UBsk_twc-z8X6kKE55Ley_e4aYNV7-eNP8D_HnUfG-M_LRcnEj5ug5yjgi0ZaUh1Prkle366XJlbwlRfvUQBZYbMtfqugHXqA4B_bIGmxyCPuhJpTUweL-VOUEuTCP8PaX_iHOHKSYUJvcBGhoY2eNLm0.F_SUrjBjJlfs94Q_SKMu2jcUoaX4sxV5irQokjegVPU&dib_tag=se&keywords=art+supplies&qid=1774550253&sprefix=art+sup%2Caps%2C151&sr=8-7",
        listedPrice: 24.99,
        status: "AVAILABLE",
      },
      {
        id: "gift-6",
        title: "Art Supply Kit",
        productUrl:
          "https://www.amazon.com/Pentel-Arts-Pastel-Assorted-Colors/dp/B001E63EKW/ref=sr_1_7?crid=2TN55QEC2C55Z&dib=eyJ2IjoiMSJ9.9dMqDKZgu1zEyiyUnCopEuT-XHbMC521m8grtaYdIDCBhJSNX13atUZJ-4nM7jCjs4Szaicy93F8JPf9fLP1oiiFAPD7z7y0nS52tfbpeoYDf35yWtpr9cLmzOvzsU17a9REIF2iK75G2X8uy8UBsk_twc-z8X6kKE55Ley_e4aYNV7-eNP8D_HnUfG-M_LRcnEj5ug5yjgi0ZaUh1Prkle366XJlbwlRfvUQBZYbMtfqugHXqA4B_bIGmxyCPuhJpTUweL-VOUEuTCP8PaX_iHOHKSYUJvcBGhoY2eNLm0.F_SUrjBjJlfs94Q_SKMu2jcUoaX4sxV5irQokjegVPU&dib_tag=se&keywords=art+supplies&qid=1774550253&sprefix=art+sup%2Caps%2C151&sr=8-7",
        listedPrice: 24.99,
        status: "AVAILABLE",
      },
    ],
  },
};

const MOCK_SIBLINGS: Record<string, Array<CarouselCardSibling>> = {
  "1": [
    {
      id: "2",
      name: "Christina Anne T. Montgomery",
      category: "super_sib",
      giftsFulfilled: 0,
      giftsTotal: 3,
    },
    {
      id: "sib-a",
      name: "Alex Martinez",
      category: "warrior",
      giftsFulfilled: 1,
      giftsTotal: 3,
    },
    {
      id: "sib-b",
      name: "Jordan Kim",
      category: "super_sib",
      giftsFulfilled: 2,
      giftsTotal: 3,
    },
    {
      id: "sib-c",
      name: "Sam Rivera",
      category: "warrior",
      giftsFulfilled: 0,
      giftsTotal: 5,
    },
    {
      id: "sib-d",
      name: "Morgan Lee",
      category: "super_sib",
      giftsFulfilled: 3,
      giftsTotal: 4,
    },
    {
      id: "sib-e",
      name: "Casey Nguyen",
      category: "warrior",
      giftsFulfilled: 1,
      giftsTotal: 2,
    },
  ],
  "2": [
    {
      id: "1",
      name: "Ryan Peirce",
      category: "warrior",
      giftsFulfilled: 0,
      giftsTotal: 3,
    },
    {
      id: "sib-a",
      name: "Alex Martinez",
      category: "warrior",
      giftsFulfilled: 1,
      giftsTotal: 3,
    },
    {
      id: "sib-b",
      name: "Jordan Kim",
      category: "super_sib",
      giftsFulfilled: 2,
      giftsTotal: 3,
    },
    {
      id: "sib-c",
      name: "Sam Rivera",
      category: "warrior",
      giftsFulfilled: 0,
      giftsTotal: 5,
    },
  ],
};

function RouteComponent() {
  const { childId } = Route.useParams();
  const child = MOCK_CHILDREN[childId] || MOCK_CHILDREN["1"];
  const siblings = MOCK_SIBLINGS[childId] ?? MOCK_SIBLINGS["1"] ?? [];

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="w-full px-3 py-4 sm:py-6 lg:px-12 lg:py-12 rounded-3xl bg-kfk-red">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 items-center md:items-stretch w-full">
              <div className="w-full max-w-sm md:max-w-none md:flex-1 md:min-w-0">
                <ChildInfoCard child={child} className="h-full" />
              </div>

              <div className="w-full md:max-w-none md:flex-[2] md:min-w-0">
                <Card className="w-full h-full">
                  <CardHeader className="py-3 sm:py-6">
                    <CardTitle className="text-xl sm:text-2xl text-center font-gaegu">
                      {child.name}'s Wish List
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <GiftTable gifts={child.gifts} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 font-gaegu">
            {child.name}'s Siblings
          </h2>
          <SiblingsCarousel siblings={siblings} />
        </div>
      </div>
    </div>
  );
}
