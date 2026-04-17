import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StorefrontNavbar } from "@/components/storefront/StorefrontNavbar";
import { StorefrontMobileSidebar } from "@/components/storefront/StorefrontMobileSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_storefront")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentDrive } = Route.useRouteContext();
  return (
    <SidebarProvider defaultOpen={false}>
      <StorefrontMobileSidebar />
      <div className="w-full h-full">
        <StorefrontNavbar currentDrive={currentDrive} />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
