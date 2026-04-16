import { Gift } from "../../../../common/src/types/gift";
import { Input } from "../ui/input";

type SelectedGiftsProps = {
  gifts : Gift[];
  isEditing: boolean;
};

export function SelectedGifts({ gifts, isEditing }: SelectedGiftsProps) {
  const activeGifts = gifts.filter((g) => g.active);
  const inactiveGifts = gifts.filter((g) => !g.active);

  const visibleGifts = isEditing
    ? [...activeGifts, ...inactiveGifts]
    : activeGifts;

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-2xl">
        Storefront Selected Gifts (3 Max)
      </h2>

      <div className="py-4 shadow-md rounded-lg border md:min-w-md max-w-lg divide-y divide-muted divide-y-2">
        {visibleGifts.map((gift, i) => {
          const isActive = gift.active;

          const index = isActive
            ? activeGifts.indexOf(gift) + 1
            : inactiveGifts.indexOf(gift) + 1;

          const label = isActive
            ? `Gift #${index}`
            : `Backup Gift #${index}`;

          return (
            <div
              key={gift.id ?? i}
              className={`flex justify-between items-center p-4`}
            >
              <div className="flex items-center gap-3">
                {isEditing && (
                  <Input
                    type="checkbox"
                    checked={gift.active}
                    onChange={() => {}}
                    className="size-5"
                  />
                )}

                <div>
                  <p className="font-medium">{label}</p>
                  <a
                    href={gift.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-kfk-blue underline"
                  >
                    {gift.title}
                  </a>
                </div>
              </div>

              <span
                className={
                  gift.status === "RECEIVED"
                    ? "px-10 py-1 border rounded-full text-kfk-green bg-kfk-muted-green/40"
                    : "px-6 py-1 border rounded-full text-kfk-red bg-kfk-muted-red/40"
                }
              >
                {gift.status === "RECEIVED"
                  ? "Received"
                  : "Not Received"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}