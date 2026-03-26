import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StorefrontNavbar } from "@/components/storefront/StorefrontNavbar";

export const Route = createFileRoute("/_storefront")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full h-full">
      <StorefrontNavbar />
      <Outlet />
    </div>
  );
}
