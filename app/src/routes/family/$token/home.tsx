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

      <div className="relative bg-kfk-blue text-white rounded-2xl p-6 shadow-xl flex items-center justify-between gap-2">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-32 h-32 bg-kfk-light-blue/10 rounded-full -top-10 -left-10"></div>
          <div className="absolute w-24 h-24 bg-kfk-light-blue/10 rounded-full top-16 -right-16"></div>
          <div className="absolute w-28 h-28 bg-kfk-light-blue/10 rounded-full -top-14 right-26"></div>
          <div className="absolute w-16 h-16 bg-kfk-light-blue/10 rounded-full bottom-6 left-8"></div>
          <div className="absolute w-36 h-36 bg-kfk-light-blue/10 rounded-full bottom-[-40px] right-20"></div>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
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