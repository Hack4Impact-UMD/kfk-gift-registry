import { Link } from "@tanstack/react-router";
import ProfilePhoto from "@/assets/default-profile-photo.png";

type Child = {
  id: string;
  name: string;
  profileImage?: string;
};

type Props = {
  child: Child;
  token: string;
};

export function ChildProfileCircle({ child, token }: Props) {
  return (
    <Link
      to="/family/$token/child/$childId"
      params={{ token, childId: child.id }}
      className="flex flex-col items-center gap-2 shrink-0"
    >
      <div className="w-16 h-16 rounded-full border-2 border-background ring-2 ring-kfk-red overflow-hidden">
        {child.profileImage ? (
          <img
            src={child.profileImage}
            alt={child.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={ProfilePhoto}
            alt={child.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <span className="text-sm font-medium">{child.name}</span>
    </Link>
  );
}