import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StorefrontNavbar } from "@/components/storefront/StorefrontNavbar";
import { StorefrontMobileSidebar } from "@/components/storefront/StorefrontMobileSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_storefront")({
  head: () => ({
    meta: [
      { title: "Gift Storefront - Kisses for Kyle" },
      {
        name: "description",
        content: "Browse and claim gifts from our gift storefront",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { currentDrive, auth } = Route.useRouteContext();
  return (
    <SidebarProvider defaultOpen={false}>
      <StorefrontMobileSidebar auth={auth} />
      <div className="w-full h-full">
        <StorefrontNavbar currentDrive={currentDrive} auth={auth} />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
