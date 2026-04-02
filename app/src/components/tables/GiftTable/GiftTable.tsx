import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { SuccessMessage } from "./SuccessMessage";
import type { GiftTableProps, GiftTableMeta } from "./types";
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

export function GiftTable({ gifts, className }: GiftTableProps) {
  const [claimedGifts, setClaimedGifts] = useState<Set<string>>(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleClaimGift = (giftId: string) => {
    setClaimedGifts((prev) => new Set(prev).add(giftId));
    setShowSuccessMessage(true);
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
    claimedGifts,
    onClaimGift: handleClaimGift,
  };

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
      <div className="flex flex-col gap-3 md:hidden">
        {gifts.map((gift, index) => {
          const isClaimed = claimedGifts.has(gift.id);

          return (
            <div
              key={gift.id}
              className={cn(
                "rounded-md p-4 bg-card transition-colors",
                isClaimed
                  ? "bg-green-50"
                  : "hover:bg-gray-50/60"
              )}
            >
              <div className="text-sm text-foreground mb-1">
                Gift #{index + 1}
              </div>

              <div className="text-kfk-red font-medium text-sm mb-1">
                {gift.listedPrice
                  ? `$${gift.listedPrice.toFixed(2)}`
                  : "N/A"}
              </div>
              <a
                href={gift.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-gaegu text-base hover:underline flex items-center gap-2 mb-3"
              >
                {gift.title}
              </a>

              <Button
                onClick={() => handleClaimGift(gift.id)}
                disabled={isClaimed}
                className={ `rounded-full w-full ${
                  isClaimed
                    ? "bg-kfk-green hover:bg-kfk-green cursor-not-allowed text-white h-auto whitespace-nowrap"
                    : "h-auto whitespace-nowrap"}`
                }
              >
                {isClaimed ? "Gift Claimed!" : "Claim Gift!"}
              </Button>
            </div>
          );
        })}
      </div>
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
                  const isClaimed = claimedGifts.has(row.id);

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
