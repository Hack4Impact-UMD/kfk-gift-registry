import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Copy } from "lucide-react";
import ColumnSortButton from "../ColumnSortButton";
import { SponsorTypeBadge } from "./SponsorTypeBadge";
import { GiftStatusBadge } from "./GiftStatusBadge";
import type { PublishedGiftsTableRow } from "./types";

const helper = createColumnHelper<PublishedGiftsTableRow>();

function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) {
    return "";
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function handleCopyEmail(email: string) {
  navigator.clipboard.writeText(email);
}

export const columns = [
  helper.display({
    id: "select",
    size: 50,
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
    size: 140,
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>ID</ColumnSortButton>
    ),
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-600 font-sans">{getValue()}</span>
    ),
  }),

  helper.accessor("giftName", {
    size: 140,
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Gift Name</ColumnSortButton>
    ),
    cell: ({ getValue, row }) => {
      const name = getValue();
      const productUrl = row.original.productUrl;
      return (
        <div className="flex items-center gap-2 group">
          <span className="text-sm text-gray-600 font-sans truncate">{name}</span>
          {productUrl && (
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
              aria-label={`Open ${name} in new tab`}
            >
              <ExternalLink className="h-4 w-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" />
            </a>
          )}
        </div>
      );
    },
  }),

  helper.accessor("giftStatus", {
    size: 140,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Gift Status</ColumnSortButton>
    ),
    cell: ({ getValue }) => <GiftStatusBadge status={getValue()} />,
  }),

  helper.accessor("sponsorType", {
    size: 140,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Sponsor Type</ColumnSortButton>
    ),
    cell: ({ getValue }) => <SponsorTypeBadge sponsorType={getValue()} />,
  }),

  helper.accessor("sponsorName", {
    size: 140,
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Sponsor Name</ColumnSortButton>
    ),
    cell: ({ getValue }) => {
      const name = getValue();
      return <span className="text-sm text-gray-600 font-sans">{name}</span>;
    },
  }),

  helper.accessor("sponsorEmail", {
    size: 140,
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Sponsor Email</ColumnSortButton>
    ),
    cell: ({ getValue }) => {
      const email = getValue();
      return (
        <div className="flex items-center gap-2 group">
          <span className="text-sm text-gray-600 font-sans truncate">{email}</span>
          {email && (
            <button
              onClick={() => handleCopyEmail(email)}
              className="flex-shrink-0"
              aria-label={`Copy ${email} to clipboard`}
            >
              <Copy className="h-4 w-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" />
            </button>
          )}
        </div>
      );
    },
  }),

  helper.accessor("dateOfFulfillment", {
    size: 140,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Date of Fulfillment</ColumnSortButton>
    ),
    cell: ({ getValue }) => {
      const date = getValue();
      return (
        <span className="text-sm text-gray-600 font-sans">
          {date ? formatDate(date) : ""}
        </span>
      );
    },
  }),
] as Array<ColumnDef<PublishedGiftsTableRow>>;
