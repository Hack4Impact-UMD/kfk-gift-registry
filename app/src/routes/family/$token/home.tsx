import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Route as FamilyTokenRoute } from "../$token";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/family/NotificationCard";
import RedGift from "@/assets/red-gift.png";
import { toast } from "@/lib/toast";
import { useFamilyNotifications } from "@/hooks/queries/useFamilyNotifications";
import {
  useClearAllNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/mutations/useNotificationMutations";

export const Route = createFileRoute("/family/$token/home")({
  head: () => ({
    meta: [
      { title: "Family Home - Kisses for Kyle" },
      {
        name: "description",
        content: "View your family's gift drive information",
      },
    ],
  }),
  component: FamilyHome,
});

function FamilyHome() {
  const data = FamilyTokenRoute.useLoaderData();
  const family = data.family;
  const { data: notificationsData } = useFamilyNotifications(
    family?.id,
    data.token,
  );
  const clearAllMutation = useClearAllNotifications(family?.id, data.token);
  const markAsReadMutation = useMarkNotificationAsRead(data.token);

  const notifications = notificationsData?.notifications ?? [];

  const [dismissedIds, setDismissedIds] = useState<Array<string>>(() => []);

  if (!family) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-foreground">Family not found</p>
      </div>
    );
  }

  const visibleNotifications = notifications.filter((n) => {
    const unread = !n.read;
    const notDismissed = !dismissedIds.includes(n.id);
    return unread && notDismissed;
  });

  const handleDismiss = async (id: string) => {
    try {
      setDismissedIds((prev) => [...prev, id]);
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      setDismissedIds((prev) => prev.filter((i) => i !== id));
      const message =
        error instanceof Error
          ? error.message
          : "Failed to dismiss notification";
      toast.error(message);
    }
  };

  const handleClearAll = async () => {
    if (family?.id) {
      try {
        await clearAllMutation.mutateAsync();
        setDismissedIds([]);
        toast.success("Notifications cleared");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to clear notifications";
        toast.error(message);
      }
    }
  };

  return (
    <div className="py-8 mt-2 flex flex-col overflow-x-hidden">
      <div className="relative bg-kfk-blue overflow-hidden text-white rounded-2xl p-6 shadow-xl flex items-center justify-between gap-2">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 364 194"
          preserveAspectRatio="none"
          fill="none"
        >
          <circle cx="84" cy="22" r="25" fill="#0A43CE" />
          <circle cx="335" cy="183" r="25" fill="#0A43CE" />
          <circle cx="147.5" cy="96.5" r="19.5" fill="#0A43CE" />
          <circle cx="238.5" cy="144.5" r="19.5" fill="#0A43CE" />
          <ellipse cx="109.5" cy="182" rx="37.5" ry="37" fill="#0A43CE" />
          <ellipse cx="219.5" cy="34" rx="37.5" ry="37" fill="#0A43CE" />
          <ellipse cx="310.5" cy="65.5" rx="24.5" ry="23.5" fill="#0A43CE" />
          <ellipse cx="24" cy="109.5" rx="37" ry="35.5" fill="#0A43CE" />
        </svg>

        <div className="relative z-10 flex flex-col gap-2">
          <h2 className="text-3xl font-semibold font-gaegu">
            Welcome, {family.contactName}!
          </h2>
          <p>Track your gifts, confirm deliveries, & thank your donors!</p>
        </div>

        <img src={RedGift} alt="Gift Box" className="max-w-32 mt-4 z-20" />
      </div>

      <>
        <div className="py-4 mt-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold mx-2">Notifications</h3>
          <Button
            variant="outline"
            className="rounded-full border-ring text-foreground"
            // TODO: implement clear functionality (swap out local storage implementation)
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {visibleNotifications.length === 0 && (
            <span className="w-full text-center text-sm text-muted-foreground">
              No notifications
            </span>
          )}
          {visibleNotifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              token={data.token}
              onDismiss={() => handleDismiss(n.id)}
            />
          ))}
        </div>
      </>
    </div>
  );
}
