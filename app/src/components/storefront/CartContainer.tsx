import { useState } from "react";
import { FamilyCartTable } from "./FamilyCartTable";
import { mockCartData } from "./cartMockData";
import type { CartFamily } from "./cartMockData";
import { cn } from "@/lib/utils";

interface CartContainerProps {
  className?: string;
  showWrapper?: boolean;
  cartData?: Array<CartFamily>;
  onRemoveGift?: (giftId: string) => void;
}

export function CartContainer({
  className = "",
  showWrapper = true,
  cartData: externalCartData,
  onRemoveGift: externalOnRemoveGift,
}: CartContainerProps) {
  // Use external state if provided, otherwise manage internal state
  const [internalCartData, setInternalCartData] =
    useState<Array<CartFamily>>(mockCartData);
  const cartData = externalCartData ?? internalCartData;

  const handleRemoveGift = (giftId: string) => {
    if (externalOnRemoveGift) {
      // Use external handler if provided
      externalOnRemoveGift(giftId);
    } else {
      // Use internal state management
      setInternalCartData((prevData) =>
        prevData
          .map((family) => ({
            ...family,
            gifts: family.gifts.filter((gift) => gift.id !== giftId),
          }))
          .filter((family) => family.gifts.length > 0),
      );
    }
  };

  const content = (
    <>
      {/* Cart Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 font-gaegu">
          Your Gift Registry Cart
        </h1>
      </div>

      {/* Cart Content */}
      {cartData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
        </div>
      ) : (
        <div className="space-y-6">
          {cartData.map((family) => (
            <FamilyCartTable
              key={family.familyId}
              family={family}
              onRemoveGift={handleRemoveGift}
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
