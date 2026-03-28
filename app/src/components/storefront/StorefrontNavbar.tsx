import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import KFKLogo from "@/assets/kfk-logo.png";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button"; 
import { 
    AdjustmentsHorizontalIcon,
    ArrowTopRightOnSquareIcon,
    MagnifyingGlassIcon,
    ShoppingCartIcon
} from "../icons";

export function StorefrontNavbar() {
  const navigate = useNavigate();
 
  // Reads search param — returns undefined on routes that don't define it
  const search = useSearch({ strict: false }) as { search?: string };
  const searchValue = search?.search ?? "";
 
  const handleSearch = (value: string) => {
    navigate({
      // @ts-ignore — search param is defined per-route
      search: (prev: any) => ({ ...prev, search: value || undefined }),
    });
  };
 
  return (
    <div className="mx-8">
      
      <div className="px-4 flex items-center justify-between">
        <Link to="/">
          <img src={KFKLogo} alt="Kisses for Kyle" className="max-w-[288px] mt-2" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/" // TEMP for "/tutorial"
            className="flex items-center whitespace-nowrap text-sm font-bold text-kfk-blue hover:underline"
          >
            Storefront Tutorial
            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 shrink-0" />
          </Link>
        </div>
      </div>

      <div className="px-4 flex items-center justify-between">
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

          <Link 
            to="/" // TEMP for "/family/recover"
          > 
            <Button variant="default">Family Recovery Link</Button>
          </Link>

          <Link 
            to="/" // TEMP for "/checkout"
          > 
            <Button variant="default">
                Your Cart
                <ShoppingCartIcon />
            </Button>
          </Link>

          <Button variant="destructive">Donate!</Button>
        </div>
      </div>

      <div className="-mx-8 my-4 bg-sidebar-ring py-[0.5px]"></div>

      <div className="px-4 pb-3 flex items-center gap-3">
        <Button 
            variant="outline" 
            className="border-sidebar-ring text-muted-foreground hover:bg-transparent"
        >
            <AdjustmentsHorizontalIcon />
            Filters
        </Button>

        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9 border-sidebar-ring"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}