import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { twMerge } from "tailwind-merge";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  options: Partial<TableOptions<TData>>;
  rowsPerPage?: number;
  paginated?: boolean;
}

export function DataTable<TData, TValue>({
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

  const getPageNumbers = (): (number | "...")[] => {
    if (pageCount <= 5){
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
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
    <div>
      <div className={twMerge("rounded-md border", className)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
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
                  onClick={() => table.setPageIndex((page as number) - 1)}
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