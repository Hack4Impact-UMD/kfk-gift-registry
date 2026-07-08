import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Copy } from "lucide-react";
import ColumnSortButton from "../ColumnSortButton";
import { SponsorTypeBadge } from "./SponsorTypeBadge";
import { GiftStatusBadge } from "./GiftStatusBadge";
import type { PublishedGiftsTableRow } from "./types";

const helper = createColumnHelper<PublishedGiftsTableRow>();

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
});

function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

function handleCopyEmail(email: string) {
  navigator.clipboard.writeText(email);
}

function EmailCell({ email }: { email: string | undefined }) {
  return (
    <div className="flex items-center gap-2 group">
      <span className="text-sm text-gray-600 font-sans truncate">{email}</span>
      {email && (
        <button
          onClick={() => handleCopyEmail(email)}
          className="shrink-0"
          aria-label={`Copy ${email} to clipboard`}
        >
          <Copy className="h-4 w-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" />
        </button>
      )}
    </div>
  );
}

export const columns = [
  helper.display({
    id: "select",
    size: 50,
    header: ({ table }) => (
      <div className="h-9 flex items-center justify-center">
        <Checkbox
          className="size-4"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="h-9 flex items-center justify-center">
        <Checkbox
          className="size-4"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select row ${row.original.id}`}
        />
      </div>
    ),
    enableSorting: false,
    enableGlobalFilter: false,
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
        <a
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 group hover:underline"
          aria-label={`Open ${name} in new tab`}
        >
          <span className="text-sm text-gray-600 font-sans truncate">
            {name}
          </span>
          {productUrl && (
            <ExternalLink className="h-4 w-4 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer" />
          )}
        </a>
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

  helper.accessor("sponsorEmail", {
    size: 140,
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Sponsor Email</ColumnSortButton>
    ),
    cell: ({ getValue }) => <EmailCell email={getValue()} />,
  }),

  helper.accessor("childName", {
    size: 140,
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Child Name</ColumnSortButton>
    ),
    cell: ({ getValue }) => {
      const name = getValue();
      return <span className="text-sm text-gray-600 font-sans">{name}</span>;
    },
  }),

  helper.accessor("parentName", {
    size: 140,
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Parent Name</ColumnSortButton>
    ),
    cell: ({ getValue }) => {
      const name = getValue();
      return <span className="text-sm text-gray-600 font-sans">{name}</span>;
    },
  }),

  helper.accessor("parentEmail", {
    size: 140,
    enableGlobalFilter: true,
    header: ({ column }) => (
      <ColumnSortButton column={column}>Parent Email</ColumnSortButton>
    ),
    cell: ({ getValue }) => <EmailCell email={getValue()} />,
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
