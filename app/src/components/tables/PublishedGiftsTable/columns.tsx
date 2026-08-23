import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/ui/copybutton";
import ColumnSortButton from "../ColumnSortButton";
import { SponsorTypeBadge } from "./SponsorTypeBadge";
import { GiftStatusBadge } from "./GiftStatusBadge";
import type { PublishedGiftsTableMeta, PublishedGiftsTableRow } from "./types";

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

function EmailCell({ email }: { email: string | undefined }) {
  return (
    <div className="flex items-center gap-2 group">
      <span className="text-sm text-gray-600 font-sans truncate">{email}</span>
      {email && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <CopyButton text={email} />
        </div>
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
          className="ml-2 size-4 border-2 border-gray-400"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="h-9 flex items-center justify-center">
        <Checkbox
          className="ml-2 size-4 border-2 border-gray-400"
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

  helper.display({
    id: "action",
    size: 140,
    header: "Claim",
    cell: ({ row, table }) => {
      const meta = table.options.meta as PublishedGiftsTableMeta | undefined;
      const rowData = row.original;

      if (rowData.sponsorType === "unclaimed") {
        const isClaiming = meta?.claimingGiftId === rowData.id;
        return (
          <Button
            size="sm"
            disabled={isClaiming}
            onClick={(e) => {
              e.stopPropagation();
              meta?.onClaimGift(rowData.id);
            }}
          >
            {isClaiming ? <Spinner /> : "Claim Gift"}
          </Button>
        );
      }

      return (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            meta?.onOpenClaimDetails(rowData);
          }}
        >
          {rowData.sponsorType === "claimed_kfk"
            ? "Manage Claim"
            : "Claim Details"}
        </Button>
      );
    },
  }),
] as Array<ColumnDef<PublishedGiftsTableRow>>;
