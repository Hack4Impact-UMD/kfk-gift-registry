import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ColumnSortButton from "../ColumnSortButton";
import { StatusBadge } from "./StatusBadge";
import type { PendingProfileTableRow } from "./types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select row ${row.original.id}`}
      />
    ),
    enableSorting: false,
    enableGlobalFilter: false,
  }),

  helper.accessor("parentGuardian", {
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Parent/Guardian</ColumnSortButton>
    ),
    cell: ({ getValue }) => {
      const name = getValue() ?? "";
      const initials = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      );
    },
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

  helper.accessor("publishedChildren", {
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Published Children</ColumnSortButton>
    ),
    cell: ({ getValue, row }) => {
      const publishedChildren = getValue();
      const totalChildren = row.original.numberOfChildren;
      const dotColor =
        publishedChildren === 0
          ? "bg-red-300"
          : publishedChildren === totalChildren
            ? "bg-green-300"
            : "bg-yellow-300";

      return (
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${dotColor}`}></div>
          <div>
            {publishedChildren}/{totalChildren} Published
          </div>
        </div>
      );
    },
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
