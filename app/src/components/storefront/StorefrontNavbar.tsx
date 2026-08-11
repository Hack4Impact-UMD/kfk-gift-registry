import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import KFKLogo from "@/assets/kfk-logo.png";
import { Button } from "@/components/ui/button";
import {
  ArrowTopRightOnSquareIcon,
  HomeIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "../icons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import type { GiftDrive } from "common";
import type { AuthContext } from "@/server/functions/auth";
import { useLocalCartData } from "@/hooks/queries/useCartGifts";
import { useStorefrontFormLink } from "@/hooks/queries/useStorefrontFormLink";
import { StorefrontFamilyRecoveryDialog } from "@/components/storefront/StorefrontFamilyRecoveryDialog";
import { StorefrontProfileMenu } from "@/components/storefront/StorefrontProfileMenu";
import { Spinner } from "../ui/spinner";
import { startStorefrontTour } from "@/components/storefront/storefrontTour";

type StorefrontNavbarProps = {
  currentDrive?: GiftDrive;
  auth: AuthContext;
};
export function StorefrontNavbar({
  currentDrive,
  auth,
}: StorefrontNavbarProps) {
  const { pathname } = useLocation();
  const showMobileSidebarTrigger = pathname !== "/";
  const { data: localCart } = useLocalCartData();
  const { data: link, isPending, error } = useStorefrontFormLink();
  const navigate = useNavigate();

  const cartCount = localCart?.length ?? 0;

  return (
    <div className="flex flex-col gap-1 px-4 md:px-8 md:items-center border-b border-b-gray-300 pb-4">
      {/* Mobile header row */}
      <div className="flex md:hidden flex-col items-start gap-3 pt-4 pb-2">
        <div className="flex w-full items-start justify-between gap-3">
          <Link to="/">
            <img src={KFKLogo} alt="Kisses for Kyle" className="max-w-62.5" />
          </Link>

          {showMobileSidebarTrigger && (
            <SidebarTrigger
              className="bg-kfk-blue hover:bg-kfk-blue/90 text-white h-10 w-10 rounded-lg shrink-0"
              openIcon={<Menu size={24} />}
            />
          )}
        </div>

        {currentDrive && (
          <Link
            to="/"
            className="border-2 border-kfk-red text-kfk-red py-1 px-8 rounded-md font-gaegu text-medium w-62.5 text-center"
          >
            {currentDrive?.cycle} Gift Drive
          </Link>
        )}
      </div>

      {/* Desktop header rows */}
      <div className="hidden md:flex w-full max-w-7xl items-end justify-between gap-8">
        <div className="flex shrink-0 flex-col gap-3">
          <Link to="/">
            <img
              src={KFKLogo}
              alt="Kisses for Kyle"
              className="max-w-[288px] mt-2"
            />
          </Link>

          {currentDrive && (
            <Link
              to="/"
              className="inline-flex h-9 w-full max-w-58 items-center justify-center rounded-md border border-kfk-red px-4 text-center font-gaegu leading-none text-kfk-red"
            >
              {currentDrive.cycle} Gift Drive
            </Link>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-end gap-5">
          <div className="flex items-center gap-4">
            <StorefrontFamilyRecoveryDialog>
              <button
                type="button"
                className="flex items-center whitespace-nowrap text-sm font-bold text-kfk-blue hover:underline cursor-pointer"
              >
                Family Recovery Link
                <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 shrink-0" />
              </button>
            </StorefrontFamilyRecoveryDialog>

            <button
              type="button"
              onClick={() => startStorefrontTour(navigate)}
              className="flex items-center whitespace-nowrap text-sm font-bold text-kfk-blue hover:underline cursor-pointer"
            >
              Storefront Tutorial
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 shrink-0" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="icon">
              <Link to="/" aria-label="Home">
                <HomeIcon className="size-5" />
              </Link>
            </Button>

            {isPending ? (
              <Spinner />
            ) : error || !link ? null : (
              <Button asChild>
                <Link
                  to="/family/form/$formLinkId/consent"
                  params={{
                    formLinkId: link.id,
                  }}
                >
                  Family Application
                </Link>
              </Button>
            )}

            {auth.isAuthed ? (
              <StorefrontProfileMenu auth={auth} />
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link
                    to="/login"
                    search={{
                      redirect: "/",
                    }}
                  >
                    <UserCircleIcon className="size-5" />
                    Login
                  </Link>
                </Button>
              </>
            )}

            <Button
              asChild
              variant="outline"
              className="relative"
              data-tour="nav-cart-link"
            >
              <Link to="/checkout">
                Your Cart
                <ShoppingCartIcon className="ml-2" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-400"
            >
              Donate!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
