import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DonorNavbar } from "@/components/donor/DonorNavbar";

export const Route = createFileRoute("/_authenticated/donor")({
  head: () => ({
    meta: [
      { title: "Donor Dashboard - Kisses for Kyle" },
      {
        name: "description",
        content: "Access your donor dashboard and manage your gifts",
      },
    ],
  }),
  component: DonorPage,
});

function DonorPage() {
  return (
    <div>
      <DonorNavbar></DonorNavbar>
      <Outlet />
    </div>
  );
}
