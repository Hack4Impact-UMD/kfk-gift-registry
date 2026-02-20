import { createFileRoute } from "@tanstack/react-router";

// TODO: Add role check on beforeLoad to ensure only admins can access these routes
export const Route = createFileRoute("/_authenticated/staff/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/staff/admin"!</div>;
}
