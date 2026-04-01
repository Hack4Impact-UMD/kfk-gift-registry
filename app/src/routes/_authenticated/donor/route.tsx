import { Outlet ,createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService.client";
import { DonorNavbar } from "@/components/donor/DonorNavbar";

export const Route = createFileRoute("/_authenticated/donor")({
  component: DonorPage,
});

function DonorPage() {
  const { auth } = Route.useRouteContext();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      await router.invalidate();
    }
  }, [router]);

  return (
    <div className="">
      <div className="p-2">
        <p>Hello, {auth.authUser.displayName ?? "Unnamed User"}!</p>
        <p>Role: {auth.authUser.role}</p>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      <DonorNavbar></DonorNavbar>
      <Outlet />
    </div>
  );
}

