import type { Gift } from "../../../../common/src/types/gift";
import { Input } from "../ui/input";

type SelectedGiftsProps = {
  gifts: Array<Gift>;
  isEditing: boolean;
  editedGifts: Array<Gift>;
  setEditedGifts: React.Dispatch<React.SetStateAction<Array<Gift>>>;
};

export function SelectedGifts({
  gifts,
  isEditing,
  editedGifts,
  setEditedGifts,
}: SelectedGiftsProps) {
  const currentGifts = isEditing ? editedGifts : gifts;
  const activeGifts = currentGifts.filter((g) => g.active);
  const inactiveGifts = currentGifts.filter((g) => !g.active);

  const visibleGifts = isEditing
    ? [...activeGifts, ...inactiveGifts]
    : activeGifts;

  const toggleGift = (giftId: string) => {
    setEditedGifts((prev) => {
        const activeCount = prev.filter((g) => g.active).length;

        return prev.map((g) => {
        if (g.id !== giftId) return g;

        if (!g.active && activeCount >= 3) {
            return g;
        }

        return {
            ...g,
            active: !g.active,
            backup: !g.backup,
        };
        });
    });
    };

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
                    onChange={() => toggleGift(gift.id)}
                    disabled={!gift.active && activeGifts.length >= 3}
                    className="size-5 mx-4"
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

              {!isEditing && (
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
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}