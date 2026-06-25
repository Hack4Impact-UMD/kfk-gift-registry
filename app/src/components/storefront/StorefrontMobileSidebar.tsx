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
import { CircleDollarSign, FormIcon } from "lucide-react";
import type { AuthContext } from "@/server/functions/auth";
import { useLogout } from "@/hooks/mutations/logoutMutation";
import { Spinner } from "../ui/spinner";
import { useStorefrontFormLink } from "@/hooks/queries/useStorefrontFormLink";
import { StorefrontFamilyRecoveryDialog } from "@/components/storefront/StorefrontFamilyRecoveryDialog";

type StorefrontMobileSidebarProps = {
  auth: AuthContext;
  cartCount: number;
};

export function StorefrontMobileSidebar({
  auth,
  cartCount,
}: StorefrontMobileSidebarProps) {
  const { pathname } = useLocation();
  // Add more page checks as needed
  const isHomePage = pathname === "/" || pathname.startsWith("/child/");
  const isCheckoutPage = pathname === "/checkout";
  const { mutate: logout, isPending: logoutPending } = useLogout();
  const { data: link, isPending, error } = useStorefrontFormLink();

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

        {auth.isAuthed && (
          <div className="border-t border-b border-gray-300 px-4 py-4">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="size-8 text-gray-700" />
              <span className="text-base font-medium">
                {auth.authUser.displayName}
              </span>
            </div>
          </div>
        )}
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
                {isPending ? (
                  <Spinner />
                ) : error || !link ? (
                  <p>Failed to fetch form link</p>
                ) : (
                  <Link
                    to="/family/form/$formLinkId/consent"
                    params={{
                      formLinkId: link.id,
                    }}
                  >
                    <FormIcon className="size-6" />
                    <span className="text-base">Go to Family Form</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <StorefrontFamilyRecoveryDialog>
                <SidebarMenuButton
                  size="lg"
                  type="button"
                  className="flex items-center gap-3 w-full text-left"
                >
                  <UsersIcon className="size-6" />
                  <span className="text-base">Family Recovery Link</span>
                </SidebarMenuButton>
              </StorefrontFamilyRecoveryDialog>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" isActive={isCheckoutPage}>
                <Link
                  to="/checkout"
                  className="relative flex items-center gap-3 w-full text-left"
                >
                  <ShoppingCartIcon className="size-6" />
                  <span className="text-base">Your Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute-top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
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
        {auth.isAuthed ? (
          <Button
            variant="default"
            className="w-full bg-kfk-blue hover:bg-kfk-blue/90"
            onClick={() => logout()}
            disabled={logoutPending}
          >
            Logout
          </Button>
        ) : (
          <Button
            asChild
            variant="default"
            className="w-full bg-kfk-blue hover:bg-kfk-blue/90"
          >
            <Link
              to="/login"
              search={{
                redirect: "/",
              }}
            >
              Login
            </Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
