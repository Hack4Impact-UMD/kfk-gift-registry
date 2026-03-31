import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { X, ExternalLink } from "lucide-react";
import type { CartGift } from "./cartMockData";
import { Button } from "@/components/ui/button";

const columnHelper = createColumnHelper<CartGift>();

export const createCartColumns = (
  onRemoveGift: (giftId: string) => void,
): Array<ColumnDef<CartGift>> => [
  columnHelper.accessor("giftName", {
    header: "Gift",
    cell: (info) => (
      <a
        href={`/storefront/product/${info.row.original.id}`}
        className="font-medium text-black hover:underline cursor-pointer font-gaegu flex items-center gap-2"
      >
        {info.getValue()}
        <ExternalLink className="h-4 w-4 text-black" />
      </a>
    ),
  }) as ColumnDef<CartGift>,
  columnHelper.accessor("childName", {
    header: "Child Name",
    cell: (info) => <span className="font-gaegu">{info.getValue()}</span>,
  }) as ColumnDef<CartGift>,
  columnHelper.accessor("price", {
    header: "Price",
    cell: (info) => (
      <span className="text-kfk-red font-semibold font-gaegu">
        ${info.getValue().toFixed(2)}
      </span>
    ),
  }) as ColumnDef<CartGift>,
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemoveGift(info.row.original.id)}
        className="h-6 w-6 p-0 hover:bg-gray-100"
      >
        <X className="h-4 w-4 text-black" />
      </Button>
    ),
  }) as ColumnDef<CartGift>,
];
