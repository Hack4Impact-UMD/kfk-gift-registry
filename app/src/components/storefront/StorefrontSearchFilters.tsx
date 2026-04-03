import { useNavigate, useSearch, Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from "@/components/icons";

export type SortOption =
  | "age-asc"
  | "age-desc"
  | "gifts-asc"
  | "gifts-desc"
  | undefined;

const sortLabel: Record<string, string> = {
  "age-asc": "Age: Youngest → Oldest",
  "age-desc": "Age: Oldest → Youngest",
  "gifts-asc": "Gifts Fulfilled: Least → Most",
  "gifts-desc": "Gifts Fulfilled: Most → Least",
};

function FilterMenuContent({
  sortValue,
  handleSort,
}: {
  sortValue: string;
  handleSort: (value: SortOption) => void;
}) {
  return (
    <>
      <DropdownMenuLabel>Sort By</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup
        value={sortValue}
        onValueChange={(v) => handleSort(v as SortOption)}
      >
        <DropdownMenuRadioItem value="age-asc">
          Age: Youngest → Oldest
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="age-desc">
          Age: Oldest → Youngest
        </DropdownMenuRadioItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioItem value="gifts-asc">
          Gifts Fulfilled: Least → Most
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="gifts-desc">
          Gifts Fulfilled: Most → Least
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      {sortValue && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleSort(undefined)}
            className="text-muted-foreground"
          >
            Clear filter
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}

function SearchInput({
  searchValue,
  handleSearch,
  className,
}: {
  searchValue: string;
  handleSearch: (value: string) => void;
  className?: string;
}) {
  return (
    <>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search"
        className={className}
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </>
  );
}

export function StorefrontSearchFilters() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_storefront/" });
  const searchValue = search?.search ?? "";
  const sortValue = search?.sort ?? "";

  const handleSearch = (value: string) => {
    navigate({
      to: "/",
      search: (prev) => ({ ...prev, search: value || undefined }),
    });
  };

  const handleSort = (value: SortOption) => {
    navigate({
      to: "/",
      search: (prev) => ({ ...prev, sort: value || undefined }),
    });
  };

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden sm:flex px-8 py-3 items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-sidebar-ring text-muted-foreground hover:bg-transparent whitespace-nowrap"
            >
              <AdjustmentsHorizontalIcon />
              {sortValue ? sortLabel[sortValue] : "Filters"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <FilterMenuContent sortValue={sortValue} handleSort={handleSort} />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative w-full">
          <SearchInput
            searchValue={searchValue}
            handleSearch={handleSearch}
            className="pl-9 border-sidebar-ring max-w-[454px]"
          />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex sm:hidden px-4 py-3 items-center gap-2">
        <div className="relative flex-1">
          <SearchInput
            searchValue={searchValue}
            handleSearch={handleSearch}
            className="pl-9 pr-10 border-sidebar-ring"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-transparent"
              >
                <AdjustmentsHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <FilterMenuContent
                sortValue={sortValue}
                handleSort={handleSort}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link to="/checkout" className="shrink-0">
          <Button
            className="h-10 w-10 bg-kfk-blue hover:bg-kfk-blue/90 text-white"
            size="icon"
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </>
  );
}
