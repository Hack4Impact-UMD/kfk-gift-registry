import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ContactInfoSection } from "@/components/profile/ProfileContactInfo";
import { AccountDetailsSection } from "@/components/profile/ProfileAccountDetails";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/mutations/logoutMutation";

export const Route = createFileRoute("/_authenticated/staff/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const { mutate: logout } = useLogout();
  return (
    <div className="flex flex-col items-center md:py-6">
      <div className="space-y-3 max-w-6xl w-full">
        <ProfileHeader authCtx={auth} />

        <ContactInfoSection authCtx={auth} />

        <AccountDetailsSection authCtx={auth} />
        <div className="flex justify-end">
          <Button
            onClick={async () => {
              logout();
            }}
            variant={"destructive"}
            className="bg-kfk-blue"
          >
            <LogOut className="h-4 w-4" />
            Log-out
          </Button>
        </div>
      </div>
    </div>
  );
}
