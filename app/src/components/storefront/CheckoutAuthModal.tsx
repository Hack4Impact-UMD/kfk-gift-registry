import KFKLogo from "@/assets/kfk-logo.png";
import { CheckoutCreateAccountModal } from "@/components/storefront/CheckoutCreateAccountModal";
import { CheckoutLoginModal } from "@/components/storefront/CheckoutLoginModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckoutFlowState } from "@/hooks/useCheckoutFlow";

export function CheckoutAuthModal({ flow }: { flow: CheckoutFlowState }) {
  if (!flow.authModalOpen) return null;

  return (
    <Dialog open={flow.authModalOpen} onOpenChange={flow.closeAll}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none bg-white shadow-lg [&>button]:top-14">
        <div className="bg-kfk-blue h-10 w-full" />

        <div className="px-25 py-8 pt-6 text-center no-scrollbar max-h-[70vh] overflow-y-auto">
          <p className="text-[15px] font-medium leading-tight mb-6">
            Wait! Before checking out, please login or create an account.
            <br />
            <p>Don't worry, we'll save your cart items!</p>
          </p>

          <div className="flex border rounded-lg mb-8 overflow-hidden">
            <button
              onClick={() => flow.setAuthMode("login")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                flow.authMode === "login"
                  ? "bg-[#E8EFFF] text-kfk-blue rounded-l-lg border border-kfk-blue"
                  : "bg-white"
              }`}
            >
              Log-in
            </button>
            <button
              onClick={() => flow.setAuthMode("register")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                flow.authMode === "register"
                  ? "bg-[#E8EFFF] text-kfk-blue rounded-r-lg border border-kfk-blue"
                  : "bg-white"
              }`}
            >
              Create Account
            </button>
          </div>

          <h2 className="font-gaegu text-xl font-bold">
            {flow.authMode == "login" ? "User Login" : "Create Account"}
          </h2>

          <img src={KFKLogo} className="w-75 mx-auto mb-5" />
          {flow.authMode == "login" ? (
            <CheckoutLoginModal flow={flow} />
          ) : (
            <CheckoutCreateAccountModal flow={flow} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
