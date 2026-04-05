import { Check } from "lucide-react";

export function SuccessMessage() {
  return (
    <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
        <Check className="h-4 w-4 text-white" />
      </div>
      <span className="font-medium">The gift was added to your cart!</span>
    </div>
  );
}
