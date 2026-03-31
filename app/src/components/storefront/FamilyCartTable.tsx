import { useMemo } from "react";
import type { CartFamily } from "./cartMockData";
import { DataTable } from "@/components/tables/DataTable";
import { createCartColumns } from "./cartColumns";
import { cn } from "@/lib/utils";

interface FamilyCartTableProps {
  family: CartFamily;
  onRemoveGift: (giftId: string) => void;
  containerClassName?: string;
}

export function FamilyCartTable({
  family,
  onRemoveGift,
  containerClassName = "",
}: FamilyCartTableProps) {
  const columns = useMemo(
    () => createCartColumns(onRemoveGift),
    [onRemoveGift],
  );

  return (
    <div className={cn("mb-8", containerClassName)}>
      {/* Family Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 font-gaegu">
          {family.parentLastName} Family
        </h3>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={family.gifts}
        paginated={false}
        className="[&_.rounded-md.border]:rounded-none [&_.rounded-md.border]:border-none [&_table]:border-collapse [&_tbody_tr]:border-b [&_tbody_tr]:border-gray-300 [&_tbody_tr:last-child]:border-b-0 [&_tr.hover\:bg-gray-50\/60]:hover:bg-transparent"
      />
    </div>
  );
}
