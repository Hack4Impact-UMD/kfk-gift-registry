import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { logout } from "@/server/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/hello")({
  component: RouteComponent,
});

/**
 * Route component that displays the authenticated user's name and role and provides a logout control.
 *
 * Renders a greeting using the current route auth context (falls back to "Unnamed User" if no display name),
 * shows the user's role, and includes a Logout button that calls the server logout and invalidates the router when clicked.
 *
 * @returns The component's JSX containing the greeting, role line, and logout button.
 */
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