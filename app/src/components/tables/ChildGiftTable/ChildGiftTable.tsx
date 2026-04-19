import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { SuccessMessage } from "./SuccessMessage";
import type {
  GiftTableProps as ChildGiftTableProps,
  GiftTableMeta,
} from "./types";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { StorefrontGift } from "@/types/storefront";
import { cartCollection } from "@/local/cartCollection";
import { useLiveQuery } from "@tanstack/react-db";

function isGiftAlreadyClaimed(gift: StorefrontGift) {
  return gift.status !== "AVAILABLE";
}

export function ChildGiftTable({ gifts, className }: ChildGiftTableProps) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { data: cartGifts } = useLiveQuery((q) =>
    q.from({ perf: cartCollection }),
  );

  const isGiftLocallyClaimed = (giftId: string) =>
    cartGifts.some((g) => g.id === giftId);
  const handleToggleClaimGift = (
    giftId: string,
    childId: string,
    familyId: string,
  ) => {
    const shouldRemoveClaim = isGiftLocallyClaimed(giftId);

    if (shouldRemoveClaim) {
      cartCollection.delete(giftId);
    } else {
      cartCollection.insert({
        id: giftId,
        childId,
        familyId,
      });
    }
    setShowSuccessMessage(!shouldRemoveClaim);
  };

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const tableMeta: GiftTableMeta = {
    isGiftAlreadyClaimed,
    isGiftClaimed: (gift) =>
      isGiftLocallyClaimed(gift.id) || isGiftAlreadyClaimed(gift),
    isGiftLocallyClaimed,
    onToggleClaimGift: handleToggleClaimGift,
  };

  //TODO: Move this over to the data table component
  const table = useReactTable({
    data: gifts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    meta: tableMeta,
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Mobile: stacked cards */}
      {gifts.length ? (
        gifts.map((gift, index) => {
          const isAlreadyClaimed = isGiftAlreadyClaimed(gift);
          const isLocallyClaimed = isGiftLocallyClaimed(gift.id);

          return (
            <div
              key={gift.id}
              className="rounded-md p-4 bg-card md:hidden transition-colors"
            >
              <div className="text-sm text-foreground mb-1">
                Gift #{index + 1}
              </div>

              <div className="text-kfk-red font-medium text-sm mb-1">
                {gift.listedPrice ? `$${gift.listedPrice.toFixed(2)}` : "N/A"}
              </div>
              <a
                href={gift.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-gaegu text-base hover:underline flex items-center gap-2"
              >
                {gift.title}
              </a>

              <span className="text-sm text-muted-foreground">
                {gift.familyPublicNotes}
              </span>

              <Button
                onClick={() =>
                  handleToggleClaimGift(gift.id, gift.childId, gift.familyId)
                }
                disabled={isAlreadyClaimed}
                className={`rounded-full mt-3 w-full ${
                  isAlreadyClaimed
                    ? "bg-kfk-green hover:bg-kfk-green cursor-not-allowed text-white h-auto whitespace-nowrap"
                    : isLocallyClaimed
                      ? "bg-kfk-green text-white hover:bg-kfk-green/90 h-auto whitespace-nowrap"
                      : "h-auto whitespace-nowrap"
                }`}
              >
                {isAlreadyClaimed
                  ? "Gift Claimed!"
                  : isLocallyClaimed
                    ? "Remove Claim"
                    : "Claim Gift!"}
              </Button>
            </div>
          );
        })
      ) : (
        <div className="rounded-md md:hidden bg-card p-4 text-center text-muted-foreground">
          No gifts available.
        </div>
      )}
      {/* Desktop: table */}
      <div className="hidden md:block">
        <div className="rounded-md overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-card">
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "font-semibold text-muted-foreground text-xs md:text-sm border-b-2 border-foreground",
                          index === 0 && "w-[42%] md:w-[55%] pr-4 md:pr-6",
                          index === 1 && "w-[18%] md:w-[18%] pl-4 md:pl-6",
                          index === 2 && "w-[40%] md:w-[27%] pl-4 md:pl-10",
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const isClaimed = tableMeta.isGiftClaimed(row.original);

                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "transition-colors",
                        isClaimed
                          ? "bg-green-50 hover:bg-green-50"
                          : "hover:bg-gray-50/60",
                      )}
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "align-middle",
                            index === 0 && "max-w-0 pr-4 sm:pr-6",
                            index === 1 && "pl-4 sm:pl-6",
                            index === 2 && "pl-4 sm:pl-6",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No gifts available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {showSuccessMessage && <SuccessMessage />}
    </div>
  );
}
