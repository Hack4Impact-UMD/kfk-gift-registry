import DefaultProfilePhoto from "@/assets/default-profile-photo.png";

type NotificationCardProps = {
  childName: string;
  giftTitle: string;
  accentColor: string;
};

export function NotificationCard({
  childName,
  giftTitle,
  accentColor,
}: NotificationCardProps) {
  const colorClasses = {
    "kfk-red": { bar: "bg-kfk-red", ring: "border-kfk-red" },
    "kfk-blue": { bar: "bg-kfk-blue", ring: "border-kfk-blue" },
    "kfk-green": { bar: "bg-kfk-green", ring: "border-kfk-green" },
  }[accentColor] ?? { bar: "bg-kfk-red", ring: "border-kfk-red" };

  return (
    <div className="flex items-stretch rounded-r-[20px] bg-card overflow-hidden border border-[2px] border-[#ececec]">
      <div className={`w-1 ${colorClasses.bar}`} />

      <div className="flex flex-1 items-center gap-4 px-4 py-3">
        <img
          src={DefaultProfilePhoto}
          alt="Child profile"
          className={`w-11 h-11 rounded-full border-[3px] object-cover ${colorClasses.ring}`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">
              {childName} Gift Delivered!
            </p>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="text-black w-2 h-[7px] flex items-center justify-center"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-foreground mt-1">
            {giftTitle}.... gift was delivered! Confirm if you received the gift!
          </p>
        </div>
      </div>
    </div>
  );
}

