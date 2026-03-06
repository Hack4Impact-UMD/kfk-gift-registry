import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/family/$token/home")({
  component: FamilyHome,
});

function FamilyHome() {
  return (
    <div className="px-4 py-8 mt-4 flex flex justify-between items-center"> 
      <h3 className="text-lg font-semibold mx-2">Notifications</h3>
      <Button variant="outline" className="rounded-full border-ring text-foreground"> 
        Clear All 
      </Button> 
    </div>
  );
}