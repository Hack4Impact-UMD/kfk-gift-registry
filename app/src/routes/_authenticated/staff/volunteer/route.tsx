import { createFileRoute } from "@tanstack/react-router";

// TODO: Add role check on beforeLoad to ensure only volunteers can access these routes
export const Route = createFileRoute("/_authenticated/staff/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer Dashboard - Kisses for Kyle" },
      {
        name: "description",
        content: "Access volunteer tools and information",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/staff/volunteer"!</div>;
}
