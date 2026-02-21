import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService.client";

export const Route = createFileRoute("/_authenticated/hello")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await logout();
    router.invalidate();
  }, [router]);

  return (
    <div className="p-2">
      <p>Hello, {auth.authUser.displayName ?? "Unnamed User"}!</p>
      <p>Role: {auth.authUser.role}</p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}
