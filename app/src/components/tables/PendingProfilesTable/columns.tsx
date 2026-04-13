import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ColumnSortButton from "../ColumnSortButton";
import { StatusBadge } from "./StatusBadge";
import type { PendingProfileTableRow } from "./types";

const helper = createColumnHelper<PendingProfileTableRow>();

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const columns = [
  helper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select row ${row.original.id}`}
      />
    ),
    enableSorting: false,
    enableGlobalFilter: false,
  }),

  helper.accessor("id", {
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>id</ColumnSortButton>
    ),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-gray-500">{getValue()}</span>
    ),
  }),

  helper.accessor("parentGuardian", {
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Parent/Guardian</ColumnSortButton>
    ),
    cell: ({ getValue }) => (
      <span className="font-medium text-gray-900">{getValue()}</span>
    ),
  }),

  helper.accessor("numberOfChildren", {
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}># of Children</ColumnSortButton>
    ),
    cell: ({ getValue }) => (
      <span className="text-center block">{getValue()}</span>
    ),
  }),

  helper.accessor("status", {
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Application Status</ColumnSortButton>
    ),
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),

  helper.accessor("submissionDate", {
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Date of Submission</ColumnSortButton>
    ),
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-600">{formatDate(getValue())}</span>
    ),
  }),

  helper.accessor("adminComments", {
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Admin Comments</ColumnSortButton>
    ),
    cell: ({ getValue }) => {
      const comment = getValue();
      return comment ? (
        <span className="text-sm text-gray-700 line-clamp-2">{comment}</span>
      ) : (
        <span className="text-xs text-gray-400 italic">No comments</span>
      );
    },
  }),
] as Array<ColumnDef<PendingProfileTableRow>>;
