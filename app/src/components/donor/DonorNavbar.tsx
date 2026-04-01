import { Link } from "@tanstack/react-router";
import { BellIcon, HomeIcon, GiftIcon } from "@heroicons/react/24/outline";
import KFKLogo from '@/assets/kfk-logo.png'

export function DonorNavbar() {
    return (
        <>
            <img src={KFKLogo} className="w-45 mb-2"/>
            <div className=" flex justify-center gap-10 bg-kfk-blue py-5 text-white shadow-md">
                <Link className="flex flex-col" to="/donor/home">
                    <HomeIcon className="size-5 mx-auto"/>
                    <span className="mx-auto">Home</span>
                </Link>
                <Link className="flex flex-col" to="/"> {/* To storefront */}
                    <GiftIcon className="size-5 mx-auto"/>
                    <span className="mx-auto">Storefront</span>
                </Link>
                <Link className="flex flex-col" to="/donor/notifications">
                    <BellIcon className="size-5 mx-auto"/>
                    <span className="mx-auto">Notifications</span>
                </Link>
            </div>
        </>
    )
}
