import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/donor/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications - Kisses for Kyle" },
      {
        name: "description",
        content: "View your notifications and updates",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/donor/notifications"!</div>;
}
