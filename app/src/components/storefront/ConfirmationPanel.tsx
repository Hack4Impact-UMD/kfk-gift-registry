import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StorefrontGift } from "@/types/storefront";
import { useMemo } from "react";

interface ConfirmationPanelProps {
  gifts: Array<StorefrontGift>;
  totalGifts: number;
  totalPrice: number;
  onConfirm?: () => void;
  className?: string;
  disabledMessage?: string | null;
}

export function ConfirmationPanel({
  gifts,
  totalGifts,
  totalPrice,
  onConfirm,
  className = "",
  disabledMessage = null,
}: ConfirmationPanelProps) {
  const giftNotAvailable = useMemo(
    () => gifts.some((g) => g.status !== "AVAILABLE"),
    [gifts],
  );
  return (
    <div className={cn("", className)}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Gifts</h2>
        <p className="text-sm text-gray-700">
          Please note that this step is a commitment to purchase the gifts,{" "}
          <b>
            <u>NOT</u>
          </b>{" "}
          the actual purchase.
        </p>
      </div>

      {/* Summary Box */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Total Gifts */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-gray-900 font-gaegu">
            Total Gifts:
          </span>
          <span className="text-lg font-bold text-kfk-red font-gaegu">
            {totalGifts}
          </span>
        </div>

        {/* Divider */}
        <div className="border-b border-black mb-4" />

        {/* Total Price */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-gray-900 font-gaegu">
            Total Price:
          </span>
          <span className="text-lg font-bold text-kfk-red font-gaegu">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Info Text */}
        <p className="text-sm text-gray-500 mb-4">
          Prices are estimates and may change depending on the online store.
          Please double check links before confirming gifts.
        </p>

        {giftNotAvailable && (
          <p className="text-sm text-red-600 mb-4">
            At least one gift in your cart is not available. Remove it to
            proceed with the checkout process.
          </p>
        )}

        {disabledMessage && (
          <p className="text-sm text-red-600 mb-4">{disabledMessage}</p>
        )}

        {/* Confirm Button */}
        <Button
          onClick={onConfirm}
          disabled={
            !onConfirm ||
            totalGifts === 0 ||
            giftNotAvailable ||
            !!disabledMessage
          }
          className="w-full rounded-full text-white font-normal py-2"
        >
          Claim Gifts
        </Button>
      </div>
    </div>
  );
}
