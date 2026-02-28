import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ContactInfoSection } from "@/components/profile/ProfileContactInfo";
import { AccountDetailsSection } from "@/components/profile/ProfileAccountDetails";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService.client";

export const Route = createFileRoute("/_authenticated/staff/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = useRouteContext({ from: "/_authenticated/staff" });
  const user = auth?.authUser;
  return (
    <div className="space-y-3 p-6">
      <ProfileHeader user={user} />

      <ContactInfoSection user={user} phone="+1 244-567-8910" />

      <AccountDetailsSection />
      <div className="flex justify-end">
        <Button
          onClick={async () => {
            try {
              await logout();
              window.location.reload();
            } catch (error) {
              console.error("Logout failed", error);
            }
          }}
          variant={"destructive"}
          className="bg-kfk-blue"
        >
          <LogOut className="h-4 w-4" />
          Log-out
        </Button>
      </div>
    </div>
  );
}
