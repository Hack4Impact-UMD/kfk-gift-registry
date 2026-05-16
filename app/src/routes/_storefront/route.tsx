import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StorefrontNavbar } from "@/components/storefront/StorefrontNavbar";
import { StorefrontMobileSidebar } from "@/components/storefront/StorefrontMobileSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useLocalCartData } from "@/hooks/queries/useCartGifts";

export const Route = createFileRoute("/_storefront")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentDrive, auth } = Route.useRouteContext();
  const { data: localCart } = useLocalCartData();
  const cartCount = localCart?.length ?? 0;

  return (
    <SidebarProvider defaultOpen={false}>
      <StorefrontMobileSidebar auth={auth} cartCount={cartCount} />
      <div className="w-full h-full">
        <StorefrontNavbar currentDrive={currentDrive} auth={auth} />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
