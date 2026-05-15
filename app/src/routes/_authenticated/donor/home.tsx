import { createFileRoute } from "@tanstack/react-router";
import { HomeHeaderCard } from "@/components/donor/HomeHeaderCard";
import { ChildBlock } from "@/components/donor/home/ChildBlock";
import DefaultProfile from "@/assets/default-profile-photo.png";
import type { CommittedChild } from "@/components/donor/home/types";

export const Route = createFileRoute("/_authenticated/donor/home")({
  head: () => ({
    meta: [
      { title: "Dashboard - Donor" },
      {
        name: "description",
        content: "View your committed gifts and manage your donations",
      },
    ],
  }),
  component: RouteComponent,
});

const COMMITTED_CHILDREN: Array<CommittedChild> = [
  {
    id: "john-doe",
    firstName: "John",
    lastName: "Doe",
    photoUrl: DefaultProfile,
    category: "Warrior",
    gifts: [
      {
        id: "gift-uno",
        title: "Uno Card Game",
        productUrl: "https://www.amazon.com",
        listedPrice: 9.99,
        additionalInfo: "Classic family version",
      },
      {
        id: "gift-hues",
        title: "HUES and CUES - Color Guessing Board Game",
        productUrl: "https://www.amazon.com",
        listedPrice: 9.95,
        additionalInfo: "small; Color: Navy/Grey/White",
      },
    ],
  },
  {
    id: "jane-doe",
    firstName: "Jane",
    lastName: "Doe",
    photoUrl: DefaultProfile,
    category: "Supersib",
    gifts: [
      {
        id: "gift-sorry",
        title: "Sorry! The Board Game",
        productUrl: "https://www.amazon.com",
        listedPrice: 9.99,
        additionalInfo: "Classic family version",
      },
      {
        id: "gift-lego",
        title: "Lego Disney Pixar Up",
        productUrl: "https://www.amazon.com",
        listedPrice: 19.95,
        additionalInfo: "medium; figurines",
      },
      {
        id: "gift-barbie",
        title: "Barbie Dreamhouse",
        productUrl: "https://www.amazon.com",
        listedPrice: 15.99,
        additionalInfo: "medium; pink figurines",
      },
    ],
  },
];

function RouteComponent() {
  const { auth } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-10 overflow-x-hidden p-5 items-center">
      <HomeHeaderCard
        displayName={auth.authUser.displayName ?? "Unnamed User"}
      />
      <div className="w-full min-w-0 max-w-150 flex flex-col gap-6 items-center">
        {COMMITTED_CHILDREN.map((child) => (
          <ChildBlock key={child.id} child={child} />
        ))}
      </div>
    </div>
  );
}
