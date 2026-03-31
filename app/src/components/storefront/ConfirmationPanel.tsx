import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmationPanelProps {
  totalGifts: number;
  totalPrice: number;
  onConfirm?: () => void;
  className?: string;
}

export function ConfirmationPanel({
  totalGifts,
  totalPrice,
  onConfirm,
  className = "",
}: ConfirmationPanelProps) {
  return (
    <div className={cn("", className)}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Gifts</h2>
        <p className="text-sm text-gray-500">
          Please note that confirming these gifts means you are committing to
          purchasing them
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
        <p className="text-xs text-gray-500 mb-4">
          Prices are estimates and may change depending on the online store.
          Please double check links before confirming gifts.
        </p>

        {/* Confirm Button */}
        <Button
          onClick={onConfirm}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-normal py-2"
        >
          Confirm Gifts
        </Button>
      </div>
    </div>
  );
}
