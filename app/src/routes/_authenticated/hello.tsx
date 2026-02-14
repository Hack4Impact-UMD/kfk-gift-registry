import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { logout } from "@/server/auth";

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
      <p>Hello, {auth.authUser.displayName}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
