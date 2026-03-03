import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getFamilyByToken } from "@/server/family";
import KFKLogo from "@/assets/kfk-logo.png";
import { BellIcon } from "@/components/icons";
import { mockFamily } from "@/mocks/mockFamily";
import { ChildProfileCircle } from "@/components/family/ChildProfileCircle";

export const Route = createFileRoute("/family/$token")({
  loader: async ({ params }) => {
    // TEMP: return mock data
    return mockFamily;
    //return await getFamilyByToken({ data: { token: params.token } });
  },
  component: FamilyRoute,
  errorComponent: FamilyError,
});

function FamilyRoute() {
  const family = Route.useLoaderData();

  return (
    <div>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <img
          src={KFKLogo}
          alt="Kisses For Kyle"
          className="h-[51px] w-[205px] object-contain"
        />
        <BellIcon className="size-6" />
      </div>

      {/* Horizontal Children Scroll */}
      <div className="flex gap-4 overflow-x-auto px-4 py-4">
        {family.children.map((child: any) => (
          <ChildProfileCircle
            key={child.id}
            child={child}
            token={family.token}
          />
        ))}
      </div>

      {/* Nested Route Content */}
      <div className="px-4 pb-8">
        <Outlet />
      </div>
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
