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
      <div className="rounded-md border bg-white overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/70">
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "font-semibold text-gray-600 text-xs sm:text-sm",
                        index === 0 && "w-[42%] sm:w-[55%] pr-4 sm:pr-6",
                        index === 1 && "w-[18%] sm:w-[18%] pl-4 sm:pl-6",
                        index === 2 && "w-[40%] sm:w-[27%] pl-4 sm:pl-6",
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
                  className="h-24 text-center text-gray-400"
                >
                  No gifts available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showSuccessMessage && <SuccessMessage />}
    </div>
  );
}
