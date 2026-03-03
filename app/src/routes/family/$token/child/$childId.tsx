import { createFileRoute } from "@tanstack/react-router";
import { Route as FamilyTokenRoute } from "../../$token";

export const Route = createFileRoute("/family/$token/child/$childId")({
  component: ChildPage,
});

function ChildPage() {
  const { childId } = Route.useParams();
  const family = FamilyTokenRoute.useLoaderData();

  const child = family.children.find((c) => c.id === childId);

  if (!child) return <div>Child not found</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{child.name}</h2>

      {child.gifts.map((gift) => (
        <div key={gift.id}>{gift.name}</div>
      ))}
    </div>
  );
}