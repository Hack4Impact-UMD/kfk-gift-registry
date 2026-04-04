import { Link, useLocation } from "@tanstack/react-router";
import LadybugIcon from "@/assets/ladybug-storefront.svg";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  HomeIcon,
  UsersIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  ChevronDoubleLeftIcon,
} from "@/components/icons";
import { CircleDollarSign } from "lucide-react";

export function StorefrontMobileSidebar() {
  const { pathname } = useLocation();
  // Add more page checks as needed
  const isHomePage = pathname === "/" || pathname.startsWith("/child/");
  const isCheckoutPage = pathname === "/checkout";

  return (
    <Sidebar collapsible="offcanvas" side="left" className="sm:hidden">
      <SidebarHeader className="flex flex-col p-0">
        <div className="px-4 pt-2">
          <div className="flex flex-col">
            <img
              src={LadybugIcon}
              alt="KFK Ladybug"
              className="h-10 w-10 object-contain"
            />
            <div className="flex justify-end">
              <SidebarTrigger
                className="rounded transition-colors duration-200 hover:bg-gray-100"
                closeIcon={<ChevronDoubleLeftIcon className="size-6" />}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-b border-gray-300 px-4 py-4">
          <div className="flex items-center gap-3">
            <UserCircleIcon className="size-8 text-gray-700" />
            <span className="text-base font-medium">Charlie Hemsworth</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="flex-col gap-2 px-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" isActive={isHomePage}>
                <Link
                  to="/"
                  className="flex items-center gap-3 w-full text-left"
                >
                  <HomeIcon className="size-6" />
                  <span className="text-base">Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link
                  to="/"
                  className="flex items-center gap-3 w-full text-left"
                >
                  <UsersIcon className="size-6" />
                  <span className="text-base">Family Recovery Link</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" isActive={isCheckoutPage}>
                <Link
                  to="/checkout"
                  className="flex items-center gap-3 w-full text-left"
                >
                  <ShoppingCartIcon className="size-6" />
                  <span className="text-base">Your Cart</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <a
                  href="https://kissesforkyle.org/donations/"
                  className="flex items-center gap-3 w-full text-left text-red-600 hover:text-red-600"
                >
                  <CircleDollarSign className="size-6" />
                  <span className="text-base font-semibold">Donate!</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        <Button
          variant="default"
          className="w-full bg-kfk-blue hover:bg-kfk-blue/90"
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
