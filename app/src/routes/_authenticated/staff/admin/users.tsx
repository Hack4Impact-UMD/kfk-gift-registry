import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/staff/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management - Admin" },
      {
        name: "description",
        content: "Manage system users and permissions",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/staff/admin/users"!</div>;
}
