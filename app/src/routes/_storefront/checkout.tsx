import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CartContainer, ConfirmationPanel } from "@/components/storefront";
import { mockCartData, type CartFamily } from "@/components/storefront/cartMockData";

export const Route = createFileRoute("/_storefront/checkout")({
  component: CheckoutComponent,
});

function CheckoutComponent() {
  const [cartData, setCartData] = useState<Array<CartFamily>>(mockCartData);

  const handleRemoveGift = (giftId: string) => {
    setCartData((prevData) =>
      prevData
        .map((family) => ({
          ...family,
          gifts: family.gifts.filter((gift) => gift.id !== giftId),
        }))
        .filter((family) => family.gifts.length > 0)
    );
  };

  // Calculate totals from current cart data
  const totalGifts = cartData.reduce(
    (sum, family) => sum + family.gifts.length,
    0
  );
  const totalPrice = cartData.reduce(
    (sum, family) =>
      sum + family.gifts.reduce((familySum, gift) => familySum + gift.price, 0),
    0
  );

  const handleConfirmGifts = () => {
    // TODO: Implement confirmation logic
    console.log("Gifts confirmed!");
  };

  return (
    <div className="min-h-screen bg-kfk-blue py-8">
      <div className="flex gap-8 px-8 max-w-full">
        {/* Left side - Cart */}
        <div className="w-[68%]">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <CartContainer
              cartData={cartData}
              onRemoveGift={handleRemoveGift}
              showWrapper={false}
            />
          </div>
        </div>

        {/* Right side - Confirmation Panel */}
        <div className="flex-1">
          <ConfirmationPanel
            totalGifts={totalGifts}
            totalPrice={totalPrice}
            onConfirm={handleConfirmGifts}
          />
        </div>
      </div>
    </div>
  );
}
