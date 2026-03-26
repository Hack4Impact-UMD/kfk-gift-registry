import { createFileRoute } from "@tanstack/react-router";
import { ChildInfoCard } from "@/components/storefront/ChildInfoCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StorefrontChild } from "@/types/storefront";
import redStripedBg from "@/assets/red-striped-background.png";

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
  },
};

function RouteComponent() {
  const { childId } = Route.useParams();
  const child = MOCK_CHILDREN[childId] || MOCK_CHILDREN["1"];

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full px-4 py-8 lg:px-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div
            className="w-full px-3 py-6 lg:px-12 lg:py-12 rounded-3xl"
            style={{
              backgroundImage: `url(${redStripedBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="overflow-x-auto -mx-3 px-3 lg:-mx-12 lg:px-12">
              <div className="flex gap-6 lg:gap-8 items-stretch min-w-max">
                <div className="flex-shrink-0 w-[320px] lg:flex-1">
                  <ChildInfoCard child={child} className="h-full" />
                </div>

                <div className="flex-shrink-0 w-[600px] lg:flex-[2]">
                  <Card className="w-full h-full">
                    <CardHeader>
                      <CardTitle className="text-2xl text-center font-gaegu">
                        {child.name}'s Wish List
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Table implementation will go here */}
                    </CardContent>
                  </Card>
                </div>
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
          <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            {/* Sibling carousel implementation will go here */}
          </div>
        </div>
      </div>
    </div>
  );
}
