import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { UserRole } from "common";

export const Route = createFileRoute("/_authenticated/staff/admin")({
  beforeLoad: ({ context }) => {
    if (
      context.auth.authUser.role !== UserRole.DIRECTOR &&
      context.auth.authUser.role !== UserRole.ADMIN
    ) {
      throw redirect({ to: "/staff/home" });
    }
  },
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
