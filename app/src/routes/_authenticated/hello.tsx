import { logout } from "@/server/auth";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";

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
    <div>
      <p>Hello, {auth.authUser.displayName}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
