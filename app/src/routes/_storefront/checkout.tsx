import { createFileRoute } from "@tanstack/react-router";
import { CartContainer, ConfirmationPanel } from "@/components/storefront";
import { useCartGifts} from "@/hooks/queries/useCartGifts";
import { useRemoveGiftFromCart} from "@/hooks/mutations/useRemoveGiftFromCart";

export const Route = createFileRoute("/_storefront/checkout")({
  component: CheckoutComponent,
});

function CheckoutComponent() {
  const{ data: cartData, isLoading} = useCartGifts();
  const removeGiftMutation = useRemoveGiftFromCart();


  const handleRemoveGift = (giftId: string) => {
    removeGiftMutation.mutate(giftId)
  };

  // Calculate totals from current cart data
  const totalGifts = cartData?.reduce(
    (sum, family) => sum + family.gifts.length,
    0
  );
  const totalPrice = cartData?.reduce(
    (sum, family) =>
      sum + family.gifts.reduce((familySum, gift) => familySum + gift.price, 0),
    0
  );

  const handleConfirmGifts = () => {
    // TODO: Implement confirmation logic
    console.log("Gifts confirmed!");
  };

  if (isLoading) {
    return <div className="min-h-screen bg-kfk-blue py-8 flex items-center justify-center">
      <p className="text-white text-lg">Loading cart...</p>
    </div>
  }

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
            totalGifts={totalGifts ?? 0}
            totalPrice={totalPrice ?? 0}
            onConfirm={handleConfirmGifts}
          />
        </div>
      </div>
    </div>
  );
}
