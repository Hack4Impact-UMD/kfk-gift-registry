import { Link } from "@tanstack/react-router";
import KFKLogo from "@/assets/kfk-logo.png";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button"; 

export function StorefrontNavbar() {
  return (
    <div className="mx-8">
      {/* Top Row */}
      <div className="px-4 flex items-center justify-between">
        <Link to="/">
          <img src={KFKLogo} alt="Kisses for Kyle" className="max-w-[288px] mt-2" />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/" // TEMP for "/tutorial"
            className="text-sm font-bold text-kfk-blue hover:underline"
          >
            Storefront Tutorial
          </Link>
        </div>
      </div>

      <div className="px-4 flex items-center justify-between">
        <Link 
            to="/"
            className="border border-kfk-red text-kfk-red py-1 px-4 rounded-sm font-gaegu"
        >
          Annual Gift Drive
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          <Link to="/login">
            <Button variant="default">Staff/Donor Log-in</Button>
          </Link>

          <Link 
            to="/" // TEMP for "/family/recover"
          > 
            <Button variant="default">Family Recovery Link</Button>
          </Link>

          <Link 
            to="/" // TEMP for "/checkout"
          > 
            <Button variant="default">Your Cart</Button>
          </Link>

          <Button variant="destructive">Donate!</Button>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center gap-3">
        <Button variant="outline">Filters</Button>

        <Input
          placeholder="Search"
          className=""
        />
      </div>
    </div>
  );
}