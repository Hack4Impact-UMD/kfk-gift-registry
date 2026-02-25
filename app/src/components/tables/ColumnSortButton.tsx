import { ChevronsDown, ChevronsUp, ChevronsUpDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ColumnSortIconProps<T, TValue> = {
  column: Column<T, TValue>;
  children?: ReactNode;
};

export default function ColumnSortButton<T, TValue>({
  children,
  column,
}: ColumnSortIconProps<T, TValue>) {
  return (
    <Button
      variant="ghost"
      className="cursor-pointer px-0"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span className="font-bold">{children}</span>
      <div>
        {column.getIsSorted() === false ? (
          <ChevronsUpDown className="h-4 w-4 ml-2" />
        ) : column.getIsSorted() === "desc" ? (
          <ChevronsDown className="h-4 w-4 ml-2" />
        ) : (
          <ChevronsUp className="h-4 w-4 ml-2" />
        )}
      </div>
    </Button>
  );
}
