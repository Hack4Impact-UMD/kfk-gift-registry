import { Outlet ,createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService.client";
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

