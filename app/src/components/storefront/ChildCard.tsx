import { Child } from "../../../../common/src/types";
import ProfilePhoto from "@/assets/default-profile-photo.png";
import { GiftIcon } from "@/components/icons/";
import { Button } from "@/components/ui/button";

export type ChildCardData = Pick<
  Child,
  "id" | "name" | "photoUrl" | "category" | "age" | "diagnosis"
> & {
  giftsRequested: number;
  giftsReceived: number;
};

interface Props {
  child: ChildCardData;
  color?: string;
  bgColor?: string;
}

export function ChildCard({ child, color, bgColor }: Props) {
  const {
    name,
    photoUrl,
    category,
    age,
    diagnosis,
    giftsRequested,
    giftsReceived,
  } = child;

  const isWarrior = category === "warrior";

  return (
    <div
      className={`flex flex-col items-center rounded-xl mt-4 mx-2 px-4 py-6 shadow-sm ${bgColor}`}
    >
      <div className={`rounded-lg w-full overflow-hidden border-4 border-${color}`}>
        <img
          src={photoUrl || ProfilePhoto}
          alt={name}
          className="w-full h-40 object-cover"
        />
      </div>

      <div className={`mt-5 px-1 w-full gap-1 bg-card border-4 border-${color} rounded-md flex flex-col items-center font-gaegu`}>
        <h3 className={`font-semibold mt-3 text-3xl text-${color}`}>{name}</h3>

        <span
          className={`text-s px-10 py-0.5 rounded-sm font-semibold border ${
            isWarrior
              ? "bg-kfk-muted-yellow/30 text-kfk-brown border-kfk-brown"
              : "bg-kfk-light-blue text-kfk-blue border-kfk-blue"
          }`}
        >
          {isWarrior ? "Warrior" : "Super Sib"}
        </span>

        <p className="text-s font-semibold">
          {age} years old
        </p>

        {isWarrior ? (
          <p className="text-s font-semibold line-clamp-2">
            {diagnosis}
          </p>
        ) : (
          <p className="text-s">&nbsp;</p>
        )}

        <div className="mb-3 flex items-center gap-1.5 text-s font-semibold text-muted-foreground">
          <GiftIcon className={`h-3 w-3 text-${color} fill-${color}`} />
          {giftsReceived} / {giftsRequested} Gifts Fulfilled
        </div>
      </div>

      <div className="mt-4 w-full">
        <Button
            type="button"
            variant="outlineShadowOnly"
            className={`text-${color} rounded-full border-2 border-${color} w-full font-gaegu font-semibold transition-shadow duration-200`}
        >
            View More
        </Button>
      </div>
    </div>
  );
}