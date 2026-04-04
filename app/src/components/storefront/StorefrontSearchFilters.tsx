import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
import { Menu } from "lucide-react";

export type StorefrontSortOption =
  | "age-asc"
  | "age-desc"
  | "gifts-asc"
  | "gifts-desc"
  | "none";

const sortLabel: Record<Exclude<StorefrontSortOption, "none">, string> = {
  "age-asc": "Age: Youngest → Oldest",
  "age-desc": "Age: Oldest → Youngest",
  "gifts-asc": "Gifts Fulfilled: Least → Most",
  "gifts-desc": "Gifts Fulfilled: Most → Least",
};

type StorefrontSearchFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: StorefrontSortOption;
  onSortChange: (value: StorefrontSortOption) => void;
};

function FilterMenuContent({
  sortValue,
  handleSort,
}: {
  sortValue: StorefrontSortOption;
  handleSort: (value: StorefrontSortOption) => void;
}) {
  return (
    <>
      <DropdownMenuLabel>Sort By</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup
        value={sortValue === "none" ? "" : sortValue}
        onValueChange={(value) => handleSort(value as StorefrontSortOption)}
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
      {sortValue !== "none" && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleSort("none")}
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
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search"
        className={className}
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </>
  );
}

export function StorefrontSearchFilters({
  searchValue,
  onSearchChange,
  onSortChange,
  sortValue,
}: StorefrontSearchFiltersProps) {
  const activeSortLabel =
    sortValue !== "none" ? sortLabel[sortValue] : undefined;

  return (
    <>
      <div className="hidden justify-center p-3 sm:flex">
        <div className="flex w-full max-w-7xl items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-sidebar-ring text-muted-foreground hover:bg-transparent whitespace-nowrap"
              >
                <AdjustmentsHorizontalIcon />
                {activeSortLabel ?? "Filters"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <FilterMenuContent
                sortValue={sortValue}
                handleSort={onSortChange}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative w-full">
            <SearchInput
              searchValue={searchValue}
              handleSearch={onSearchChange}
              className="border-sidebar-ring pl-9"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 sm:hidden">
        <SidebarTrigger
          className="h-10 w-10 shrink-0 rounded-lg bg-kfk-blue text-white hover:bg-kfk-blue/90"
          openIcon={<Menu size={24} />}
        />

        <div className="relative flex-1">
          <SearchInput
            searchValue={searchValue}
            handleSearch={onSearchChange}
            className="border-sidebar-ring pl-9 pr-10"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
              >
                <AdjustmentsHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <FilterMenuContent
                sortValue={sortValue}
                handleSort={onSortChange}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link to="/checkout" className="shrink-0">
          <Button
            className="h-10 w-10 bg-kfk-blue text-white hover:bg-kfk-blue/90"
            size="icon"
          >
            <ShoppingCartIcon className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </>
  );
}
