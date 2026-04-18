import { useMemo } from "react";
import type { CartFamilyGroup } from "@/server/functions/cart";
import { DataTable } from "@/components/tables/DataTable";
import { createCartColumns } from "./cartColumns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FamilyCartTableProps {
  family: CartFamilyGroup;
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
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 font-gaegu">
          {family.family.contactName} Family
        </h3>
      </div>

      {/* Mobile View */}
      <div className="flex flex-col gap-2 md:hidden">
        {family.gifts.map((gift, index) => (
          <div key={gift.id} className="p-2 bg-card flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">
              Gift #{index + 1}
            </span>

            <span className="text-kfk-red font-medium font-gaegu">
              {gift.listedPrice !== undefined
                ? `$${gift.listedPrice.toFixed(2)}`
                : "N/A"}
            </span>

            <a
              href={gift.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium font-gaegu"
            >
              {gift.title}
            </a>

            <Button
              onClick={() => onRemoveGift(gift.id)}
              className="rounded-full"
            >
              Remove from Cart
            </Button>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={family.gifts}
          paginated={false}
          className="[&_.rounded-md.border]:rounded-none [&_.rounded-md.border]:border-none [&_table]:border-collapse [&_tbody_tr]:border-b [&_tbody_tr]:border-gray-300 [&_tbody_tr:last-child]:border-b-0 [&_tr.hover\:bg-gray-50\/60]:hover:bg-transparent [&_th]:border-b-2 [&_th]:border-b-foreground"
        />
      </div>
    </div>
  );
}
