import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/staff/home")({
  head: () => ({
    meta: [
      { title: "Dashboard - Staff" },
      {
        name: "description",
        content: "Staff dashboard for managing the gift drive program",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/staff/home"!</div>;
}
