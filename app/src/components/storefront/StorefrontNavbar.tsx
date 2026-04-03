import { Link } from "@tanstack/react-router";
import KFKLogo from "@/assets/kfk-logo.png";
import { Button } from "@/components/ui/button";
import { ArrowTopRightOnSquareIcon, ShoppingCartIcon } from "../icons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export function StorefrontNavbar() {
  return (
    <div className="relative px-4 sm:px-8 border-b border-b-gray-300 pb-4">
      {/* Mobile header row */}
      <div className="flex md:hidden flex-col items-start pt-4 pb-2 gap-3">
        <Link to="/">
          <img src={KFKLogo} alt="Kisses for Kyle" className="max-w-[250px]" />
        </Link>

        <Link
          to="/"
          className="border-2 border-kfk-red text-kfk-red py-1 px-8 rounded-md font-gaegu text-medium w-[250px] text-center"
        >
          2026 Gift Drive
        </Link>

        <SidebarTrigger
          className="bg-kfk-blue hover:bg-kfk-blue/90 text-white h-10 w-10 rounded-lg shrink-0"
          openIcon={<Menu size={24} />}
        />
      </div>

      {/* Desktop header rows */}
      <div className="hidden md:flex px-4 items-center justify-between">
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

      <div className="hidden md:flex px-4 items-center justify-between">
        <Link
          to="/"
          className="border border-kfk-red text-kfk-red py-1 px-20 rounded-sm font-gaegu"
        >
          Annual Gift Drive
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="default">Staff/Donor Log-in</Button>
          </Link>

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
  );
}
