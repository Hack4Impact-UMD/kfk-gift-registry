import { Gift } from "../../../../common/src/types/gift";

export function SelectedGifts({ gifts }: { gifts: Gift[] }) {
    
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-2xl">Storefront Selected Gifts (3 Max)</h2>
      <div className="py-4 shadow-md rounded-lg border md:min-w-md max-w-lg divide-y divide-muted divide-y-2">
        {gifts
            .filter((gift) => gift.active)
            .map((gift, i) => (
                <div key={i} className="flex justify-between items-center p-4">
                    <div>
                        <p className="font-medium">Gift #{i + 1}</p>
                        <a
                        href={gift.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-kfk-blue underline"
                        >
                        {gift.title}
                        </a>
                    </div>

                    <span
                        className={
                        gift.status == "RECEIVED"
                            ? "px-10 py-1 border rounded-full text-kfk-green bg-kfk-muted-green/40"
                            : "px-6 py-1 border rounded-full text-kfk-red bg-kfk-muted-red/40"
                        }
                    >
                        {gift.status == "RECEIVED" ? "Received" : "Not Received"}
                    </span>
                </div>
            ))}
        </div>
    </div>
  );
}