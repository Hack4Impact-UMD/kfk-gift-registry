import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService.client";
import { useCurrentUserProfile } from "@/hooks/queries/useCurrentUserProfile";

export const Route = createFileRoute("/_authenticated/hello")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const router = useRouter();
  const { data: profile, isPending, error } = useCurrentUserProfile();

  const handleLogout = useCallback(async () => {
    await logout();
    router.invalidate();
  }, [router]);

  return (
    <div className="p-2">
      <p>Hello, {auth.authUser.displayName ?? "Unnamed User"}!</p>
      <p>Role: {auth.authUser.role}</p>
      {isPending ? (
        <p>Profile pending...</p>
      ) : error ? (
        <p>Profile error: {error.message}</p>
      ) : (
        <p>Profile ID: {profile.id}</p>
      )}
      <div className="mt-4">
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}
