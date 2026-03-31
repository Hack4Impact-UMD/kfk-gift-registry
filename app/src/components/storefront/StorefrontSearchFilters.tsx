import { useNavigate, useSearch } from "@tanstack/react-router";
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
    <div className="px-8 pb-3 flex items-center gap-3">
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
        </DropdownMenuContent>
      </DropdownMenu>

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
  );
}
