import { Button } from "@/components/ui/button";
import { Route as FamilyTokenRoute } from "../$token";
import { createFileRoute } from "@tanstack/react-router";
import RedGift from "@/assets/red-gift.png";

export const Route = createFileRoute("/family/$token/home")({
  component: FamilyHome,
});

function FamilyHome() {
  const family = FamilyTokenRoute.useLoaderData();

  return (
    <div className="px-4 py-8 mt-2 flex flex-col"> 

      <div className="bg-kfk-blue text-white rounded-2xl p-6 shadow-xl flex items-center justify-between gap-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold font-gaegu">
            Welcome, {family.familyName} Family!
          </h2>
          <p>
            Track your gifts, confirm deliveries, & thank your donors!
          </p>
        </div>
        
        <img src={RedGift} alt="Gift Box" className="w-48 mt-4" />
      </div>

      <div className="py-8 mt-4 flex flex justify-between items-center">
        <h3 className="text-lg font-semibold mx-2">Notifications</h3>
        <Button variant="outline" className="rounded-full border-ring text-foreground"> 
          Clear All 
        </Button> 
      </div>
    </div>
  );
}