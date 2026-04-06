import { Link, useLocation } from "@tanstack/react-router";
import { BellIcon, HomeIcon, GiftIcon } from "@heroicons/react/24/outline";
import KFKLogo from "@/assets/kfk-logo.png";

export function DonorNavbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <img
        src={KFKLogo}
        alt="Kisses for Kyle Foundations Logo"
        className="w-45 mb-2"
      />
      <div className=" flex justify-center gap-10 bg-kfk-blue py-5 text-white shadow-md">
        <Link className="flex flex-col" to="/donor/home">
          <HomeIcon className={`size-6 mx-auto`} />
          <span
            className={`mx-auto ${isActive("/donor/home") ? "underline" : ""} font-bold decoration-2`}
          >
            Home
          </span>
        </Link>
        <Link className="flex flex-col" to="/">
          {" "}
          {/* To storefront */}
          <GiftIcon className="size-6 mx-auto" />
          <span
            className={`mx-auto ${isActive("/") ? "underline" : ""} font-bold decoration-2`}
          >
            Storefront
          </span>
        </Link>
        <Link className="flex flex-col" to="/donor/notifications">
          <BellIcon className="size-6 mx-auto" />
          <span
            className={`mx-auto ${isActive("/donor/notifications") ? "underline" : ""} font-bold decoration-2`}
          >
            Notifications
          </span>
        </Link>
      </div>
    </>
  );
}
