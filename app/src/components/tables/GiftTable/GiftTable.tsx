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
      }, 8000);

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
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/70">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-gray-600 text-sm"
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
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
