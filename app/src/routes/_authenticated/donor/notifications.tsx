import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/donor/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/donor/notifications"!</div>;
}
