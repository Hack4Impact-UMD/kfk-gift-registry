import { createFileRoute } from "@tanstack/react-router";
import { Route as FamilyTokenRoute } from "../../$token";
import { GiftIcon } from "@/components/icons";
import { GiftCard } from "@/components/family/GiftCard";
import ProfilePhoto from "@/assets/default-profile-photo.png";

export const Route = createFileRoute("/family/$token/child/$childId")({
  component: ChildPage,
});

function ChildPage() {
  const { childId } = Route.useParams();
  const family = FamilyTokenRoute.useLoaderData();

  const child = family.children.find((c) => c.id === childId);
  const firstName = child?.name.trim().split(/\s+/)[0];

  if (!child) return <div>Child not found</div>;

  return (
    <div>
      <div className={`rounded-2xl bg-kfk-blue p-6 shadow-xl relative overflow-hidden my-6`}>
        <div className="flex gap-6 items-center">

          <div className="flex flex-col items-center gap-3 min-w-[140px]">
            <div className="w-28 h-32">
              <img
                src={child.profileImage ?? ProfilePhoto}
                alt={child.name}
                className="w-full h-full object-cover rounded-3xl border-4 border-white"
              />
            </div>

            <p className="text-white text-lg tracking-widest font-gaegu">{child.name}</p>

            <span className={`px-4 py-1 rounded-full border border-foreground text-sm font-gaegu text-foreground
              ${
                child.label === "Warrior"
                  ? "bg-kfk-muted-yellow"
                  : "bg-kfk-light-blue"
              }`}
            >
              {child.label}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {child.gifts.map((gift) => {
              const received = gift.status === "received";

              return (
                <div
                  key={gift.id}
                  className="bg-white rounded-2xl p-4 shadow"
                >
                  <div
                    className={`text-center py-1 rounded-full mb-2 ${
                      received
                        ? "bg-kfk-muted-green text-green-800"
                        : "bg-kfk-muted-red text-red-700"
                    }`}
                  >
                    {received ? "Recieved" : "Not Recieved"}
                  </div>

                  <p className="text-center text-sm font-gaegu">
                    {gift.name}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      <div className={`flex items-center justify-center gap-2 mb-4 bg-kfk-blue text-white px-3 py-2 -mx-4`}>
        <GiftIcon className="size-6 text-background" />
        <h2 className="text-semibold">{firstName}'s Gift Information</h2>
      </div>

      {child.gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
          color={child.color}
        />
      ))}
    </div>
  );
}