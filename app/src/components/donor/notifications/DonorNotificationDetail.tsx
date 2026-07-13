import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { formatNotificationTimestamp } from "./utils";
import type { DonorNotificationListItem } from "./types";

type DonorNotificationDetailProps = {
  notification: DonorNotificationListItem;
};

export function DonorNotificationDetail({
  notification,
}: DonorNotificationDetailProps) {
  const navigate = useNavigate();

  const body = useMemo(() => {
    if (notification.type === "PURCHASE_CONFIRMATION_NEEDED") {
      return (
        <>
          <p className="text-[18px] leading-10 text-[#1F2937]">
            <span className="font-semibold text-kfk-blue">
              {notification.giftTitle}
            </span>{" "}
            has been reserved but is not yet marked as purchased. Please
            complete the purchase below. Once delivery is complete, please
            update the status in the app.
          </p>

          <p className="mt-8 text-[18px] italic leading-10 text-[#1F2937]">
            We kindly ask that you allow some time for delivery to help ensure
            gifts arrive in time for the holidays.
          </p>

          <p className="mt-8 text-[18px] leading-10 text-[#1F2937]">
            Thank you for your contribution!
          </p>
        </>
      );
    }

    return (
      <>
        <p className="text-[18px] leading-10 text-[#1F2937]">
          After delivery is complete, please confirm{" "}
          <span className="font-semibold text-kfk-blue">
            {notification.giftTitle}
          </span>{" "}
          has been successfully delivered.
        </p>

        <p className="mt-8 text-[18px] leading-10 text-[#1F2937]">
          Thank you for your contribution!
        </p>
      </>
    );
  }, [notification.giftTitle, notification.type]);

  const handleCopyAddress = async () => {
    if (notification.addressLines.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(notification.addressLines.join("\n"));
      toast.success("Address copied");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="px-6 pb-10 pt-6">
      <h1 className="text-[28px] leading-tight text-[#1F2937]">
        {notification.type === "PURCHASE_CONFIRMATION_NEEDED"
          ? "Purchase Confirmation Needed"
          : "Delivery Confirmation Needed"}
      </h1>

      <div className="mt-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="size-[58px] border border-[#F15A29] ring-1 ring-[#8BC34A]">
            <AvatarImage
              src={notification.childPhotoUrl}
              alt={notification.childName}
            />
          </Avatar>

          <div>
            <h2 className="font-gaegu text-[24px] font-bold leading-none text-[#1F2937]">
              {notification.childName}
            </h2>
            <span
              className={
                notification.childCategory === "Warrior"
                  ? "mt-2 inline-flex rounded-full bg-[#FFF1B8] px-4 py-1 text-sm font-semibold text-[#8A5A00]"
                  : "mt-2 inline-flex rounded-full bg-[#D4EAFF] px-4 py-1 text-sm font-semibold text-kfk-blue"
              }
            >
              {notification.childCategory}
            </span>
          </div>
        </div>

        <p className="pt-2 text-sm text-[#4B5563]">
          {formatNotificationTimestamp(notification.createdAt)}
        </p>
      </div>

      <div className="mt-10">{body}</div>

      {notification.type === "PURCHASE_CONFIRMATION_NEEDED" &&
      notification.addressLines.length > 0 ? (
        <div className="mt-10">
          <h3 className="text-[18px] font-semibold text-[#1F2937]">
            Delivery Address
          </h3>
          <div className="mt-2 space-y-0.5 text-[18px] leading-8 text-[#1F2937]">
            {notification.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCopyAddress}
            className="mt-3 inline-flex items-center gap-2 text-[16px] text-[#4B5563] hover:text-kfk-blue"
          >
            <span>Copy Address</span>
            <Copy className="size-4" />
          </button>
        </div>
      ) : null}

      <div className="mt-12 flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          className="h-12 flex-1 rounded-[12px] border-2 border-kfk-blue bg-white font-gaegu text-[18px] font-bold text-kfk-blue hover:bg-kfk-blue/5"
          onClick={() =>
            navigate({
              to: "/donor/notifications",
              search: (prev) => ({ ...prev, notificationId: undefined }),
            })
          }
        >
          ‹ Back
        </Button>
        <Button
          type="button"
          className="h-12 flex-1 rounded-[12px] bg-kfk-blue font-gaegu text-[18px] font-bold text-white hover:bg-kfk-blue/90"
          onClick={() => navigate({ to: "/donor/home" })}
        >
          Go to action
        </Button>
      </div>

      <div className="mt-10 text-center">
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
