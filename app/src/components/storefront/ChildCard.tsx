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
}

export function ChildCard({ child }: Props) {
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
      className={`flex flex-col items-center rounded-xl px-2 py-4 shadow-sm bg-kfk-red`}
    >
      <div className="rounded-lg overflow-hidden border-2 border-kfk-red">
        <img
          src={photoUrl || ProfilePhoto}
          alt={name}
          className="w-full h-40 object-cover"
        />
      </div>

      <div className="mt-4 px-1 bg-card border-2 border-kfk-red rounded-sm flex flex-col items-center font-gaegu">
        <h3 className="font-semibold text-xl text-kfk-red">{name}</h3>

        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium border border-foreground ${
            isWarrior
              ? "bg-kfk-muted-yellow/30"
              : "bg-kfk-light-blue text-kfk-blue border-kfk-blue"
          }`}
        >
          {isWarrior ? "Warrior" : "Super Sib"}
        </span>

        <p className="text-xs mt-1">
          {age} years old
        </p>

        <p className="text-xs mt-1 line-clamp-2">
          {diagnosis}
        </p>

        <div className="my-1 flex items-center text-xs font-medium text-muted-foreground">
          <GiftIcon className="h-3 w-3 mr-2 text-card fill-kfk-red" /> {giftsReceived} / {giftsRequested} gifts
        </div>
      </div>

      <div className="mt-4">
        <Button
            type="button"
            variant="outline"
            className="text-kfk-red rounded-full border-2 border-kfk-red w-full font-gaegu"
        >
            View More
        </Button>
      </div>
    </div>
  );
}