import { createFileRoute } from "@tanstack/react-router";
import { getFamilyByToken } from "@/server/family";
import KFKLogo from "@/assets/kfk-logo.png";
import { BellIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/family/$token")({
  loader: async ({ params }) => {
    return await getFamilyByToken({ data: { token: params.token } });
  },
  component: FamilyRoute,
  errorComponent: FamilyError,
});

function FamilyRoute() {
  // const family = Route.useLoaderData();

  return (
    <div>
      <div className="flex items-center justify-between px-2 py-2">
        <img
          src={KFKLogo}
          alt="Kisses For Kyle"
          className="h-[51px] w-[205px] object-contain opacity-100 group-data-[collapsible=icon]:opacity-0"
        />
        <BellIcon className="size-6 mr-4" />
      </div>
      <div className="px-4 py-8 mt-4 flex flex justify-between items-center">
        <h3 className="text-lg font-semibold mx-2 px-2">Notifications</h3>
        <Button variant="outline" className="rounded-full border-ring text-foreground">
          Clear All
        </Button>
      </div>
      
      {/*

      <h1>Hi this is unique to {family.childName}</h1>
      <p>Data for {family.childName}</p>
      <p>Parent: {family.parentName}</p>
      <p>Email: {family.email}</p>
      <p>Diagnosis: {family.diagnosis}</p>
        */}
    </div>
  );
}

function FamilyError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Invalid link";

  return (
    <div>
      <h1>Unable to load family</h1>
      <p>{message}</p>
    </div>
  );
}
