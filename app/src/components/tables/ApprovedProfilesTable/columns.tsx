import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ColumnSortButton from "../ColumnSortButton";
import { ApprovedProfileTableRow } from "./ApprovedProfilesTable";

export const columns: ColumnDef<ApprovedProfileTableRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "childName",
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Child Name
      </ColumnSortButton>
    ),
  },
  {
    accessorKey: "parentGuardian",
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Parent/Guardian
      </ColumnSortButton>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Email
      </ColumnSortButton>
    ),
  },
  {
    accessorKey: "age",
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Age
      </ColumnSortButton>
    ),
  },
  {
    accessorKey: "diagnosis",
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Diagnosis
      </ColumnSortButton>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Type
      </ColumnSortButton>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as "warrior" | "supersib";
      return (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            type === "warrior"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {type === "warrior" ? "Warrior" : "SuperSib"}
        </span>
      );
    },
  },
  {
    accessorKey: "giftsFulfilled",
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Gift Fulfillment
      </ColumnSortButton>
    ),
    cell: ({ row }) => {
      const fulfilled = row.getValue("giftsFulfilled") as number;
      const total = row.original.giftsTotal;
      return `${fulfilled}/${total} gifts`;
    },
  },
];
