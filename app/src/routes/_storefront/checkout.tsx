import { createFileRoute } from "@tanstack/react-router";
import { CartContainer, ConfirmationPanel } from "@/components/storefront";
import { useCartGifts } from "@/hooks/queries/useCartGifts";
import { useRemoveGiftFromCart } from "@/hooks/mutations/useRemoveGiftFromCart";
import { ConfirmGiftsModal } from "@/components/storefront/ConfirmGiftsPopup.tsx";
import { useState } from "react";

export const Route = createFileRoute("/_storefront/checkout")({
  component: CheckoutComponent,
});

function CheckoutComponent() {
  const { data: cartData, isLoading, isError } = useCartGifts();
  const removeGiftMutation = useRemoveGiftFromCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemoveGift = (giftId: string) => {
    removeGiftMutation.mutate(giftId);
  };

  // Calculate totals from current cart data
  const totalGifts = cartData?.reduce(
    (sum, family) => sum + family.gifts.length,
    0,
  );
  const totalPrice = cartData?.reduce(
    (sum, family) =>
      sum +
      family.gifts.reduce(
        (familySum, gift) => familySum + (gift.listedPrice ?? 0),
        0,
      ),
    0,
  );

  const handleConfirmGifts = () => {
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-kfk-blue py-8 flex items-center justify-center">
        <p className="text-white text-lg">Loading cart...</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-screen bg-kfk-blue py-8 flex items-center justify-center">
        <p className="text-white text-lg">
          Unable to load cart. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-16 my-8 rounded-lg bg-kfk-blue py-8">
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
            totalGifts={totalGifts ?? 0}
            totalPrice={totalPrice ?? 0}
            onConfirm={handleConfirmGifts}
          />
        </div>
      </div>

      <ConfirmGiftsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
