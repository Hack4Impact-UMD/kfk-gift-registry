import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Column } from "@tanstack/react-table";

type ColumnSortIconProps<T, V> = {
  column: Column<T, V>;
  children?: ReactNode;
};

export default function ColumnSortButton<T, V>({
  children,
  column,
}: ColumnSortIconProps<T, V>) {
  return (
    <Button
      variant="ghost"
      className="cursor-pointer"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span className="font-bold">{children}</span>
      <div>
        {column.getIsSorted() === false ? (
          <ArrowUpDown className="h-4 w-4 ml-2" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4 ml-2" />
        ) : (
          <ArrowUp className="h-4 w-4 ml-2" />
        )}
      </div>
    </Button>
  );
}