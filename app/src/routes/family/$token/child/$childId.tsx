import { createFileRoute } from "@tanstack/react-router";
import { Route as FamilyTokenRoute } from "../../$token";
import { GiftIcon } from "@/components/icons";
import { GiftCard } from "@/components/family/GiftCard";

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
      <h2 className="text-xl font-semibold mb-4">{child.name}</h2>

      <div className={`flex items-center justify-center gap-2 mb-4 bg-${child.color} text-white px-3 py-2 -mx-4`}>
        <GiftIcon className="size-6 text-background" />
        <h2 className="text-semibold">{firstName}'s Gift Information</h2>
      </div>

      {child.gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
        />
      ))}
    </div>
  );
}