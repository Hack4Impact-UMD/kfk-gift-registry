import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/family/drive/$driveId")({
  head: () => ({
    meta: [
      { title: "Family Registration - Kisses for Kyle" },
      {
        name: "description",
        content: "Register your family for the gift drive",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
