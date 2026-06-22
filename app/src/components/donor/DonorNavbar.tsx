import { Link, useLocation } from "@tanstack/react-router";
import { BellIcon, HomeIcon, GiftIcon } from "@heroicons/react/24/outline";
import KFKLogo from "@/assets/kfk-logo.png";
import { DonorProfileMenu } from "@/components/donor/DonorProfileMenu";

type DonorNavbarProps = {
  displayName: string;
};

export function DonorNavbar({ displayName }: DonorNavbarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3 md:px-6">
        <img
          src={KFKLogo}
          alt="Kisses for Kyle Foundations Logo"
          className="w-45"
        />
        <DonorProfileMenu displayName={displayName} />
      </div>

      <div className="flex items-center justify-center gap-10 border-b bg-kfk-blue px-4 py-5 text-white shadow-md md:px-6">
        <Link className="flex flex-col items-center" to="/donor/home">
          <HomeIcon className="size-6" />
          <span
            className={`${isActive("/donor/home") ? "underline" : ""} font-bold decoration-2`}
          >
            Home
          </span>
        </Link>
        <Link className="flex flex-col items-center" to="/">
          <GiftIcon className="size-6" />
          <span
            className={`${isActive("/") ? "underline" : ""} font-bold decoration-2`}
          >
            Storefront
          </span>
        </Link>
        <Link className="flex flex-col items-center" to="/donor/notifications">
          <BellIcon className="size-6" />
          <span
            className={`${isActive("/donor/notifications") ? "underline" : ""} font-bold decoration-2`}
          >
            Notifications
          </span>
        </Link>
      </div>
    </>
  );
}
