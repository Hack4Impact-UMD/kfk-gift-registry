import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import DefaultProfile from "@/assets/default-profile-photo.png";
import { Spinner } from "@/components/ui/spinner";
import { useDonorNotifications } from "@/hooks/queries/useDonorNotifications";
import { useDonorCommittedChildren } from "@/hooks/queries/useDonorCommittedChildren";
import { useMarkDonorNotificationAsRead } from "@/hooks/mutations/useDonorNotifications";
import { DonorNotificationCard } from "@/components/donor/notifications/DonorNotificationCard";
import { DonorNotificationDetail } from "@/components/donor/notifications/DonorNotificationDetail";
import { DonorNotificationsEmptyState } from "@/components/donor/notifications/DonorNotificationsEmptyState";
import type { DonorNotificationListItem } from "@/components/donor/notifications/types";
import { filterNotifications } from "@/components/donor/notifications/utils";
import { cn } from "@/lib/utils";
import { queries } from "@/queries";

function formatAddressLines(
  address:
    | {
        street: string;
        addressLine2?: string;
        city: string;
        state: string;
        zipCode: string;
      }
    | null
    | undefined,
): Array<string> {
  if (!address) {
    return [];
  }

  const lines = [address.street.trim()];
  if (address.addressLine2?.trim()) {
    lines.push(address.addressLine2.trim());
  }
  lines.push(
    `${address.city.trim()}, ${address.state.trim()} ${address.zipCode.trim()}`,
  );
  return lines.filter(Boolean);
}

export const Route = createFileRoute("/_authenticated/donor/notifications")({
  validateSearch: z.object({
    tab: z.enum(["unread", "read"]).optional(),
    notificationId: z.string().optional(),
  }),
  beforeLoad: async ({ context }) => {
    const driveId = context.currentDrive?.id ?? "";
    await Promise.all([
      context.queryClient.prefetchQuery(queries.donor.notifications(driveId)),
      context.queryClient.prefetchQuery(queries.donor.home(driveId)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Notifications - Kisses for Kyle" },
      {
        name: "description",
        content: "View your notifications and updates",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { currentDrive } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const { tab = "unread", notificationId } = Route.useSearch();
  const driveId = currentDrive?.id ?? "";

  const {
    data: notificationsData,
    isPending: notificationsPending,
    isError: notificationsError,
  } = useDonorNotifications(driveId);
  const {
    data: committedChildren,
    isPending: childrenPending,
    isError: childrenError,
  } = useDonorCommittedChildren(driveId);
  const markAsRead = useMarkDonorNotificationAsRead();
  const [markedIds, setMarkedIds] = useState<Array<string>>([]);

  const notifications = useMemo(
    () => notificationsData?.notifications ?? [],
    [notificationsData],
  );
  const children = useMemo(() => committedChildren ?? [], [committedChildren]);

  const enrichedNotifications = useMemo<
    Array<DonorNotificationListItem>
  >(() => {
    const childById = new Map(
      children.map((child) => [
        child.id,
        {
          childName: `${child.firstName} ${child.lastName}`.trim(),
          childPhotoUrl: child.photoUrl || DefaultProfile,
          childCategory: child.category,
          giftsById: new Map(child.gifts.map((gift) => [gift.id, gift])),
        },
      ]),
    );

    return notifications.map((notification) => {
      const child = childById.get(notification.childId);
      const gift = child?.giftsById.get(notification.giftId);

      return {
        ...notification,
        read: notification.read || markedIds.includes(notification.id),
        childName: child?.childName ?? "Unknown Child",
        childPhotoUrl: child?.childPhotoUrl ?? DefaultProfile,
        childCategory: child?.childCategory ?? "Warrior",
        giftTitle: gift?.title ?? "Gift",
        giftStatus: gift?.status ?? "CLAIMED",
        trackingNumber: gift?.trackingNumber ?? null,
        addressLines:
          notification.type === "PURCHASE_CONFIRMATION_NEEDED"
            ? formatAddressLines(gift?.familyAddress)
            : [],
      };
    });
  }, [children, markedIds, notifications]);

  const visibleNotifications = useMemo(
    () => filterNotifications(enrichedNotifications, tab),
    [enrichedNotifications, tab],
  );

  const selectedNotification = useMemo(
    () =>
      enrichedNotifications.find(
        (notification) => notification.id === notificationId,
      ),
    [enrichedNotifications, notificationId],
  );

  const handleOpenNotification = (id: string) => {
    const notification = enrichedNotifications.find((item) => item.id === id);
    if (!notification || notification.read) {
      return;
    }

    setMarkedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    markAsRead.mutate({
      notificationId: id,
      driveId,
    });
  };

  if (notificationsPending || childrenPending) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Spinner />
      </div>
    );
  }

  if (notificationsError || childrenError) {
    return (
      <div className="px-4 py-8 text-center text-[#4B5563]">
        Unable to load notifications. Please try again.
      </div>
    );
  }

  if (selectedNotification) {
    return <DonorNotificationDetail notification={selectedNotification} />;
  }

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pb-10 pt-8 md:max-w-3xl md:px-6">
      <h1 className="text-center font-gaegu text-[42px] font-bold text-[#173B8F]">
        Notifications
      </h1>

      <div className="mt-8 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-8 text-[18px] text-[#374151]">
          {[
            { key: "unread", label: "Unread" },
            { key: "read", label: "Read" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={cn(
                "border-b-[3px] pb-1.5",
                tab === item.key
                  ? "border-kfk-blue font-medium text-[#1F2937]"
                  : "border-transparent text-[#4B5563]",
              )}
              onClick={() =>
                navigate({
                  to: "/donor/notifications",
                  search: {
                    tab: item.key as "unread" | "read",
                    notificationId: undefined,
                  },
                })
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "unread" && visibleNotifications.length > 0 ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="text-[16px] font-medium text-kfk-blue hover:underline"
            onClick={() => {
              const unreadIds = enrichedNotifications
                .filter((notification) => !notification.read)
                .map((notification) => notification.id);
              setMarkedIds((prev) =>
                Array.from(new Set([...prev, ...unreadIds])),
              );
              unreadIds.forEach((id) =>
                markAsRead.mutate({
                  notificationId: id,
                  driveId,
                }),
              );
            }}
          >
            Mark all as read
          </button>
        </div>
      ) : null}

      {visibleNotifications.length === 0 ? (
        <DonorNotificationsEmptyState />
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {visibleNotifications.map((notification, index) => (
            <DonorNotificationCard
              key={notification.id}
              notification={notification}
              index={index}
              onOpen={handleOpenNotification}
            />
          ))}
        </div>
      )}

      <div className="mt-14 text-center">
        <a
          href="mailto:info@kissesforkyle.org"
          className="text-[16px] italic text-[#4B5563] underline underline-offset-4"
        >
          Have a question?
        </a>
      </div>
    </div>
  );
}
