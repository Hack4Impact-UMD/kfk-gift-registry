import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { ContactInfoSection } from "@/components/profile/ProfileContactInfo"

export const Route = createFileRoute("/_authenticated/staff/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = useRouteContext({ from: "/_authenticated/staff" });
  const user = auth?.authUser;
  return (
    <div className="space-y-8 p-6">
        <ProfileHeader user={user} />
    
        <ContactInfoSection
          user={user}
          phone="+1 244-567-8910"
        />
    </div>
  )
}
