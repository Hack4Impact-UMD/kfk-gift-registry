import { Link, useLocation } from "@tanstack/react-router";
import KFKLogo from "@/assets/kfk-logo.png";
import { Button } from "@/components/ui/button";
import { ArrowTopRightOnSquareIcon, ShoppingCartIcon } from "../icons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import type { GiftDrive } from "common";
import { UserRole } from "common";
import type { AuthContext } from "@/server/functions/auth";

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

  return (
    <div className="flex px-4 md:px-8 md:justify-center border-b border-b-gray-300 pb-4">
      {/* Mobile header row */}
      <div className="flex md:hidden flex-col items-start pt-4 pb-2 gap-3">
        <Link to="/">
          <img src={KFKLogo} alt="Kisses for Kyle" className="max-w-62.5" />
        </Link>

        {currentDrive && (
          <Link
            to="/"
            className="border-2 border-kfk-red text-kfk-red py-1 px-8 rounded-md font-gaegu text-medium w-62.5 text-center"
          >
            {currentDrive?.cycle} Gift Drive
          </Link>
        )}

        {showMobileSidebarTrigger && (
          <SidebarTrigger
            className="bg-kfk-blue hover:bg-kfk-blue/90 text-white h-10 w-10 rounded-lg shrink-0"
            openIcon={<Menu size={24} />}
          />
        )}
      </div>

      {/* Desktop header rows */}
      <div className="hidden md:block w-full max-w-7xl">
        <div className="hidden md:flex items-center justify-between">
          <Link to="/">
            <img
              src={KFKLogo}
              alt="Kisses for Kyle"
              className="max-w-[288px] mt-2"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center whitespace-nowrap text-sm font-bold text-kfk-blue hover:underline"
            >
              Storefront Tutorial
              <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 shrink-0" />
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between gap-4">
          {currentDrive && (
            <Link
              to="/"
              className="border border-kfk-red text-kfk-red py-1 max-w-58 text-center w-full rounded-sm font-gaegu"
            >
              {currentDrive.cycle} Gift Drive
            </Link>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {!auth.isAuthed ? (
              <Link to="/login">
                <Button variant="default">Log-in</Button>
              </Link>
            ) : auth.authUser.role === UserRole.DONOR ? (
              <Link to="/donor/home">
                <Button variant="default">Go to Donor Home</Button>
              </Link>
            ) : (
              <Link to="/staff/home">
                <Button variant="default">Go to Staff Home</Button>
              </Link>
            )}

            <Link to="/">
              <Button variant="default">Family Recovery Link</Button>
            </Link>

            <Link to="/checkout">
              <Button variant="default">
                Your Cart
                <ShoppingCartIcon />
              </Button>
            </Link>

            <Button variant="destructive">Donate!</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
