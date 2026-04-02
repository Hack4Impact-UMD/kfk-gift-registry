import { Link } from "@tanstack/react-router";
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
  return (
    <Sidebar collapsible="offcanvas" side="left" className="sm:hidden">
      <SidebarHeader className="border-b px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <img
            src={LadybugIcon}
            alt="KFK Ladybug"
            className="h-10 w-10 object-contain"
          />
          <SidebarTrigger
            className="rounded transition-colors duration-200 hover:bg-gray-100"
            closeIcon={<ChevronDoubleLeftIcon className="size-6" />}
          />
        </div>

        <div className="flex items-center gap-3">
          <UserCircleIcon className="size-8 text-gray-700" />
          <span className="text-base font-medium">Charlie Hemsworth</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="flex-col gap-2 px-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
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
              <SidebarMenuButton asChild size="lg">
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
                <Link
                  to="/"
                  className="flex items-center gap-3 w-full text-left text-red-600 hover:text-red-600"
                >
                  <CircleDollarSign className="size-6" />
                  <span className="text-base font-semibold">Donate!</span>
                </Link>
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
