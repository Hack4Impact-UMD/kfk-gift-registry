import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { X, ExternalLink, AlertCircleIcon } from "lucide-react";
import type { CartFamilyGroup } from "@/server/functions/cart";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type CartColumnGift = CartFamilyGroup["gifts"][number];

const columnHelper = createColumnHelper<CartColumnGift>();

export const createCartColumns = (
  onRemoveGift: (giftId: string) => void,
): Array<ColumnDef<CartColumnGift>> => [
  columnHelper.accessor("title", {
    header: "Gift",
    cell: ({ getValue, row }) => (
      <div className="flex items-center gap-2">
        <a
          href={row.original.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-black hover:underline cursor-pointer font-gaegu flex items-center gap-2"
        >
          {getValue()}
          <ExternalLink className="h-4 w-4 text-black" />
        </a>
        {row.original.status !== "AVAILABLE" && (
          <Tooltip>
            <TooltipTrigger>
              <span className="bg-red-100 text-red-600 rounded-full border-red-600 border-2 text-sm px-3 py-1 flex gap-2 items-center">
                <AlertCircleIcon className="size-4" /> Gift Not Available!
              </span>
            </TooltipTrigger>
            <TooltipContent>
              This gift has been claimed by another donor. Remove it to proceed
              with the checkout process.
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    ),
  }) as ColumnDef<CartColumnGift>,
  columnHelper.accessor("listedPrice", {
    header: "Price",
    cell: (info) => {
      const price = info.getValue();

      return (
        <span className="text-kfk-red font-semibold font-gaegu">
          {price !== undefined ? `$${price.toFixed(2)}` : "N/A"}
        </span>
      );
    },
  }) as ColumnDef<CartColumnGift>,
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => (
      <Button
        variant="ghost"
        size="sm"
        aria-label="Remove gift from cart"
        title="Remove gift from cart"
        onClick={() => onRemoveGift(info.row.original.id)}
        className="h-6 w-6 p-0 hover:bg-gray-100"
      >
        <X className="h-4 w-4 text-black" />
      </Button>
    ),
  }) as ColumnDef<CartColumnGift>,
];
