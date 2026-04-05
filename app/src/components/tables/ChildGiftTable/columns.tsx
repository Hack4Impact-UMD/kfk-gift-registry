import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { StorefrontGift } from "@/types/storefront";
import type { GiftTableMeta } from "./types";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const helper = createColumnHelper<StorefrontGift>();

export const columns = [
  helper.accessor("title", {
    header: "Gift",
    cell: ({ getValue, row }) => {
      const title = getValue();
      const url = row.original.productUrl;

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 text-foreground hover:underline font-gaegu text-sm sm:text-base lg:text-lg whitespace-pre-wrap"
        >
          <span className="grow">{title}</span>
          <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        </a>
      );
    },
  }),
  helper.accessor("listedPrice", {
    header: "Price",
    cell: ({ getValue }) => {
      const price = getValue();
      return (
        <span className="text-kfk-red font-medium text-sm sm:text-base whitespace-nowrap">
          {price ? `$${price.toFixed(2)}` : "N/A"}
        </span>
      );
    },
  }),
  helper.display({
    id: "action",
    header: "Click to Claim",
    cell: ({ row, table }) => {
      const meta = table.options.meta as GiftTableMeta | undefined;
      const giftId = row.original.id;
      const isClaimed = meta?.claimedGifts.has(giftId) ?? false;

      return (
        <Button
          onClick={() => meta?.onClaimGift(giftId)}
          disabled={isClaimed}
          className={`rounded-full min-w-[132px] my-4 ${
            isClaimed
              ? "bg-kfk-green hover:bg-kfk-green cursor-not-allowed text-white text-[10px] sm:text-xs lg:text-sm px-2 py-1 sm:px-3 sm:py-1.5 h-auto whitespace-nowrap"
              : "text-[10px] sm:text-xs lg:text-sm px-2 py-1 sm:px-3 sm:py-1.5 h-auto whitespace-nowrap"
          }`}
        >
          {isClaimed ? "Gift Claimed!" : "Claim Gift!"}
        </Button>
      );
    },
  }),
] as Array<ColumnDef<StorefrontGift>>;
