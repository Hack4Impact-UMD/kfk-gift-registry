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
    <div className="min-w-0 space-y-4">
      <h2 className="font-semibold text-2xl">
        Storefront Selected Gifts (3 Max)
      </h2>

      <div className="w-full divide-y divide-muted rounded-lg border py-4 shadow-md divide-y-2">
        {visibleGifts.map((gift, i) => {
          const isActive = gift.active;

          const index = isActive
            ? activeGifts.indexOf(gift) + 1
            : inactiveGifts.indexOf(gift) + 1;

          const label = isActive ? `Gift #${index}` : `Backup Gift #${index}`;

          return (
            <div
              key={gift.id ?? i}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                {isEditing && (
                  <Input
                    type="checkbox"
                    checked={gift.active}
                    onChange={() => toggleGift(gift.id)}
                    disabled={!gift.active && activeGifts.length >= 3}
                    className="mt-1 size-5 shrink-0"
                  />
                )}

                <div className="min-w-0">
                  <p className="font-medium break-words">{label}</p>
                  <a
                    href={gift.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-kfk-blue underline break-words"
                  >
                    {gift.title}
                  </a>
                </div>
              </div>

              {!isEditing && (
                <span
                  className={
                    gift.status === "RECEIVED"
                      ? "self-start shrink-0 rounded-full border bg-kfk-muted-green/40 px-6 py-1 text-kfk-green"
                      : "self-start shrink-0 rounded-full border bg-kfk-muted-red/40 px-4 py-1 text-kfk-red"
                  }
                >
                  {gift.status === "RECEIVED" ? "Received" : "Not Received"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
