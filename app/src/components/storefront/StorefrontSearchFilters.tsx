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

export type StorefrontSortOption =
  | "age-asc"
  | "age-desc"
  | "gifts-asc"
  | "gifts-desc"
  | "none";

const sortLabel: Record<string, string> = {
  "age-asc": "Age: Youngest → Oldest",
  "age-desc": "Age: Oldest → Youngest",
  "gifts-asc": "Gifts Fulfilled: Least → Most",
  "gifts-desc": "Gifts Fulfilled: Most → Least",
};

type StorefrontSearchFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: string;
  onSortChange: (value: StorefrontSortOption) => void;
};

export function StorefrontSearchFilters({
  searchValue,
  onSearchChange,
  onSortChange,
  sortValue,
}: StorefrontSearchFiltersProps) {
  const handleSearch = (value: string) => {
    onSearchChange(value);
  };

  const handleSort = (value: StorefrontSortOption) => {
    onSortChange(value);
  };

  return (
    <div className="p-3 flex justify-center items-center">
      <div className="w-full max-w-7xl flex items-center gap-3">
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
              onValueChange={(v) => handleSort(v as StorefrontSortOption)}
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
                  onClick={() => handleSort("none")}
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
    </div>
  );
}
