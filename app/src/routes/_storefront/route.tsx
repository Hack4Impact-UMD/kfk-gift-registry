import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_storefront")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full h-full">
      <div className="h-10 p-2 flex items-center bg-blue-200">Header Ex</div>
      <Outlet />
    </div>
  );
}
