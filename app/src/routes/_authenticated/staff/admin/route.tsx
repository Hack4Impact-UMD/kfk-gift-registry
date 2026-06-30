import { Outlet, createFileRoute } from "@tanstack/react-router";

// TODO: Add role check on beforeLoad to ensure only admins can access these routes
export const Route = createFileRoute("/_authenticated/staff/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard - Kisses for Kyle" },
      {
        name: "description",
        content: "Access admin controls and settings",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
