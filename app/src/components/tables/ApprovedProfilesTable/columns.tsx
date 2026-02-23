import { createColumnHelper } from "@tanstack/react-table";
import ColumnSortButton from "../ColumnSortButton";
import type { ColumnDef } from "@tanstack/react-table";
import type { ApprovedProfileTableRow } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyButton } from "@/components/ui/copybutton";

const helper = createColumnHelper<ApprovedProfileTableRow>();

export const columns = [
  helper.display({
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
  }),
  helper.accessor("childName", {
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Child Name</ColumnSortButton>
    ),
    cell: ({ getValue, row }) => {
      const name = getValue();
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
  }),
  helper.accessor("parentGuardian", {
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Parent/Guardian</ColumnSortButton>
    ),
  }),
  helper.accessor("email", {
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Email</ColumnSortButton>
    ),
    cell: ({ getValue }) => {
      const email = getValue();
      return (
        <div className="flex items-center justify-between gap-2">
          <span>{email}</span>
          <CopyButton text={email} />
        </div>
      );
    },
  }),
  helper.accessor("age", {
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Age</ColumnSortButton>
    ),
  }),
  helper.accessor("diagnosis", {
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Diagnosis</ColumnSortButton>
    ),
  }),
  helper.accessor("type", {
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Warrior or Super Sib</ColumnSortButton>
    ),
    cell: ({ getValue }) => {
      const type = getValue();
      return (
        <span
          className={`inline-flex items-center justify-center rounded-full min-w-22.5 py-1 text-sm font-semibold ${
            type === "warrior"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {type === "warrior" ? "Warrior" : "SuperSib"}
        </span>
      );
    },
  }),
  helper.accessor("giftsFulfilled", {
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Gift Fulfillment</ColumnSortButton>
    ),
    cell: ({ getValue, row }) => {
      const fulfilled = getValue();
      const total = row.original.giftsTotal;
      const dotColor =
        fulfilled === 0
          ? "bg-red-300"
          : fulfilled === total
            ? "bg-green-300"
            : "bg-yellow-300";
      return (
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${dotColor}`}></div>
          <div>
            {fulfilled}/{total} Gifts
          </div>
        </div>
      );
    },
  }),
] as Array<ColumnDef<ApprovedProfileTableRow>>;
