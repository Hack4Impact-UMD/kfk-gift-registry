import { FamilyCartTable } from "./FamilyCartTable";
import type { CartFamilyGroup } from "@/server/functions/cart";
import { cn } from "@/lib/utils";

interface CartContainerProps {
  className?: string;
  showWrapper?: boolean;
  cartData: Array<CartFamilyGroup>;
  onRemoveGift: (giftId: string) => void;
}

export function CartContainer({
  className = "",
  showWrapper = true,
  cartData,
  onRemoveGift,
}: CartContainerProps) {
  const content = (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 font-gaegu">
          Your Gift Drive Cart
        </h1>
      </div>

      {cartData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
        </div>
      ) : (
        <div className="space-y-6">
          {cartData.map((family, index) => (
            <FamilyCartTable
              index={index}
              key={family.family.id}
              family={family}
              onRemoveGift={onRemoveGift}
            />
          ))}
        </div>
      )}
    </>
  );

  if (!showWrapper) {
    return content;
  }

  return (
    <div className={cn("min-h-screen bg-kfk-blue py-8", className)}>
      <div className="w-[68%] ml-8 mr-auto bg-white rounded-lg shadow-lg p-8">
        {content}
      </div>
    </div>
  );
}
