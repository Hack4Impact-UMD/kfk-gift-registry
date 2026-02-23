import ColumnSortButton from "../ColumnSortButton";
import type { ApprovedProfileTableRow } from "./ApprovedProfilesTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const columns: Array<ColumnDef<ApprovedProfileTableRow>> = [
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
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Child Name
      </ColumnSortButton>
    ),
    cell: ({ row }) => {
      const name = row.getValue("childName") as string;
      const profilePictureUrl = row.original.profilePictureUrl;

      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profilePictureUrl} alt={name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "parentGuardian",
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Parent/Guardian
      </ColumnSortButton>
    ),
  },
  {
    accessorKey: "email",
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Email
      </ColumnSortButton>
    ),
  },
  {
    accessorKey: "age",
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Age
      </ColumnSortButton>
    ),
  },
  {
    accessorKey: "diagnosis",
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Diagnosis
      </ColumnSortButton>
    ),
  },
  {
    accessorKey: "type",
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Warrior or Super Sib
      </ColumnSortButton>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type");
      return (
        <span
          className={`inline-flex items-center justify-center rounded-full min-w-[90px] py-1 text-sm font-semibold ${
            type === "warrior"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {type === "warrior" ? "Warrior" : "SuperSib"}
        </span>
      );
    },
  },
  {
    accessorKey: "giftsFulfilled",
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>
        Gift Fulfillment
      </ColumnSortButton>
    ),
    cell: ({ row }) => {
      const fulfilled = row.getValue("giftsFulfilled") as number;
      const total = row.original.giftsTotal;
      const dotColor = fulfilled === 0
        ? "bg-red-300"
        : fulfilled === 3
          ? "bg-green-300"
          : "bg-yellow-300"
      return (
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${dotColor}`}></div>
          <div>{fulfilled}/{total} Gifts</div>
        </div>
      )
    },
  },
];
