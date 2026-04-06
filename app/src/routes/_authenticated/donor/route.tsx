import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DonorNavbar } from "@/components/donor/DonorNavbar";

export const Route = createFileRoute("/_authenticated/donor")({
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
