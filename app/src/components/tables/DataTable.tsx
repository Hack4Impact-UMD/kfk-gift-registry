import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { twMerge } from "tailwind-merge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import type {
  ColumnDef,
  TableOptions
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  className?: string;
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
  options?: Partial<TableOptions<TData>>;
  rowsPerPage?: number;
  paginated?: boolean;
  globalSearch?: string;
  onGlobalSearchChange?: (value: string) => void
}

export function DataTable<TData, TValue>({
  globalSearch,
  onGlobalSearchChange,
  columns,
  data,
  options = {},
  className = "",
  rowsPerPage = 10,
  paginated = true,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: globalSearch,
    },
    onGlobalFilterChange: onGlobalSearchChange,
    getCoreRowModel: getCoreRowModel(), // These are here by default, should be able to override with options,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(paginated
      ? {
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
          pagination: {
            pageSize: rowsPerPage,
            pageIndex: 0,
          },
        },
      }
      : {}),
    ...options,
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageIndex = paginated ? table.getState().pagination.pageIndex : 0;
  const pageSize = paginated ? table.getState().pagination.pageSize : totalRows;
  const firstRow = paginated ? pageIndex * pageSize + 1 : 1;
  const lastRow = paginated
    ? Math.min((pageIndex + 1) * pageSize, totalRows)
    : totalRows;

  const pageCount = table.getPageCount();
  const currentPage = pageIndex + 1;

  const getPageNumbers = (): Array<number | "..."> => {
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    const pages: Array<number | "..."> = [];
    const addPage = (p: number) => {
      if (!pages.includes(p)) {
        pages.push(p);
      }
    };

    addPage(1);
    if (currentPage - 1 > 2) pages.push("...");
    if (currentPage - 1 > 1) addPage(currentPage - 1);
    addPage(currentPage);
    if (currentPage + 1 < pageCount) addPage(currentPage + 1);
    if (currentPage + 1 < pageCount - 1) pages.push("...");
    addPage(pageCount);

    return pages;
  };

  return (
    <div className={twMerge("flex flex-col gap-3", className)}>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/70">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-gray-600 text-sm">
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-gray-500">
          {totalRows === 0
            ? "No results"
            : `Showing ${firstRow}-${lastRow} of ${totalRows}`}
        </span>

        {paginated && pageCount > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-sm text-gray-400 select-none"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "ghost"}
                  size="icon"
                  className={twMerge(
                    "h-8 w-8 text-sm",
                    page === currentPage
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                  onClick={() => table.setPageIndex((page) - 1)}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Button>
              ),
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
