import { createFileRoute } from "@tanstack/react-router";
import { CartContainer, ConfirmationPanel } from "@/components/storefront";
import {
  useGroupedCartGifts,
  useLocalCartData,
} from "@/hooks/queries/useCartGifts";
import { ConfirmGiftsModal } from "@/components/storefront/ConfirmGiftsPopup.tsx";
import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cartCollection } from "@/local/cartCollection";
import { CheckoutAuthModal } from "@/components/storefront/CheckoutAuthModal";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import MfaMethodDialog from "@/components/auth/MfaMethodDialog";
import MfaDialog from "@/components/auth/MfaDialog";

export const Route = createFileRoute("/_storefront/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - Kisses for Kyle" },
      {
        name: "description",
        content: "Review and confirm your gift selections",
      },
    ],
  }),
  component: CheckoutComponent,
  ssr: false,
});

function CheckoutComponent() {
  const { data: localCart } = useLocalCartData();
  const {
    data: cartData,
    isPending,
    isError,
  } = useGroupedCartGifts(localCart ?? []);
  const { auth } = Route.useRouteContext();
  const flow = useCheckoutFlow(auth);

  const handleRemoveGift = (giftId: string) => {
    cartCollection.delete(giftId);
  };

  const familyGroups = useMemo(
    () => (cartData ? Object.values(cartData) : []),
    [cartData],
  );
  const totalGifts = useMemo(
    () => familyGroups.reduce((sum, family) => sum + family.gifts.length, 0),
    [familyGroups],
  );
  const totalPrice = useMemo(
    () =>
      familyGroups.reduce(
        (sum, family) =>
          sum +
          family.gifts.reduce(
            (familySum, gift) => familySum + (gift.listedPrice ?? 0),
            0,
          ),
        0,
      ),
    [familyGroups],
  );

  if (isPending) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <Spinner />
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
    <div className="w-full flex justify-center px-4 py-8 md:py-4">
      <div className="max-w-7xl w-full min-h-150 rounded-lg bg-kfk-blue p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 max-w-full">
          {/* Left side - Cart */}
          <div className="md:w-[68%]">
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
              <CartContainer
                cartData={familyGroups}
                onRemoveGift={handleRemoveGift}
                showWrapper={false}
              />
            </div>
          </div>

          {/* Right side - Confirmation Panel */}
          <div className="flex-1">
            <ConfirmationPanel
              gifts={Object.values(cartData).flatMap((g) => g.gifts)}
              totalGifts={totalGifts}
              totalPrice={totalPrice}
              onConfirm={flow.start}
              disabledMessage={flow.disabledMessage}
            />
          </div>
        </div>

        <ConfirmGiftsModal
          isOpen={flow.confirmModalOpen}
          onClose={flow.closeAll}
          onConfirm={flow.confirmClaim}
          isLoading={flow.isPending}
        />
      </div>
      <MfaMethodDialog {...flow.mfaMethodDialogProps} />
      <MfaDialog {...flow.mfaDialogProps} />
      <CheckoutAuthModal flow={flow} />
    </div>
  );
}
