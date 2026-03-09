import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { getFamilyByToken } from "@/server/family";
import KFKLogo from "@/assets/kfk-logo.png";
import { HomeIcon } from "@/components/icons";
import { mockFamily } from "@/mocks/mockFamily";
import { ChildProfileCircle } from "@/components/family/ChildProfileCircle";

export const Route = createFileRoute("/family/$token")({
  loader: async ({ params }) => {
    // TEMP: return mock data
    return mockFamily;
    // return await getFamilyByToken({ data: { token: params.token } });
  },
  component: FamilyRoute,
  errorComponent: FamilyError,
});

function FamilyRoute() {
  const family = Route.useLoaderData();

  return (
    <div className="h-screen bg-background flex flex-col items-center overflow-hidden">
      <div className="flex h-screen flex-col max-w-2xl w-full">
        <div className="z-100 bg-white w-full">
          <div className="flex items-center py-3 px-4">
            <img
              src={KFKLogo}
              alt="Kisses For Kyle Logo"
              className="h-[60px] w-[198px] object-contain"
            />
          </div>
          <div className="flex gap-6 overflow-x-auto px-4 py-4 items-center">
            <Link
              to="/family/$token/home"
              params={{ token: family.token }}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-kfk-yellow border-2 border-background ring-2 ring-kfk-yellow flex items-center justify-center">
                <HomeIcon className="size-10 text-background" />
              </div>
              <span className="text-sm font-medium">Home</span>
            </Link>

            <div className="w-[2px] h-16 bg-ring shrink-0 rounded-full"></div>

            {family.children.map((child, index: number) => {
              const ringClasses = ["ring-kfk-red", "ring-kfk-blue", "ring-kfk-green"];
              const ringClass = ringClasses[index % ringClasses.length];

              return (
                <ChildProfileCircle
                  key={child.id}
                  child={child}
                  ringClass={ringClass}
                  token={family.token}
                />
              );
            })}
          </div>
        </div>

        <div className="px-4 overflow-y-auto grow min-h-0">
          <Outlet />
        </div>
      </div>
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
