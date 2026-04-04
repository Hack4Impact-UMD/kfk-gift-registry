import type { Child } from "../../../../common/src/types";
import ProfilePhoto from "@/assets/default-profile-photo.png";
import { GiftIcon } from "@/components/icons/";
import { Button } from "@/components/ui/button";
import type { CSSProperties } from "react";

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
  className?: string;
}

function getPatternStyle(color: string): CSSProperties {
  if (color === "kfk-red") {
    return {
      backgroundImage: `repeating-linear-gradient(
        -45deg,
        #ff0000 0px,
        #ff0000 40px,
        #ff6666 40px,
        #ff6666 80px
      )`,
    };
  }
  if (color === "kfk-green") {
    return {
      backgroundImage: `repeating-linear-gradient(
        -45deg,
        #1bce1b 0px,
        #1bce1b 40px,
        #17b017 40px,
        #17b017 80px
      )`,
    };
  }
  if (color === "kfk-brown") {
    return {
      backgroundColor: "#ffde43",
      backgroundImage: `
      radial-gradient(circle, #ffca15 40%, transparent 40%),
      radial-gradient(circle, #ffca15 40%, transparent 40%)
    `,
      backgroundSize: "180px 180px",
      backgroundPosition: "0 0, 90px 90px",
    };
  }
  if (color === "kfk-blue") {
    return {
      backgroundColor: "#0839b1",
      backgroundImage: `
      radial-gradient(circle, #1a3fbf 40%, transparent 40%),
      radial-gradient(circle, #1a3fbf 40%, transparent 40%)
    `,
      backgroundSize: "180px 180px",
      backgroundPosition: "0 0, 90px 90px",
    };
  }
  return {};
}

const colorClasses: Record<
  string,
  { border: string; text: string; fill: string }
> = {
  "kfk-red": {
    border: "border-kfk-red",
    text: "text-kfk-red",
    fill: "fill-kfk-red",
  },
  "kfk-brown": {
    border: "border-kfk-brown",
    text: "text-kfk-brown",
    fill: "fill-kfk-brown",
  },
  "kfk-green": {
    border: "border-kfk-green",
    text: "text-kfk-green",
    fill: "fill-kfk-green",
  },
  "kfk-blue": {
    border: "border-kfk-blue",
    text: "text-kfk-blue",
    fill: "fill-kfk-blue",
  },
};

export function ChildCard({ child, color, className = "" }: Props) {
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
  const styles = colorClasses[color ?? ""] ?? {
    border: "",
    text: "",
    fill: "",
  };

  return (
    <div
      className={`flex flex-col items-center rounded-xl px-2 sm:px-4 py-3 sm:py-6 shadow-sm h-full ${className}`}
      style={getPatternStyle(color ?? "")}
    >
      <div
        className={`rounded-lg w-full overflow-hidden border-2 sm:border-4 ${styles.border}`}
      >
        <img
          src={photoUrl || ProfilePhoto}
          alt={name}
          className="w-full h-32 sm:h-40 object-cover"
        />
      </div>

      <div
        className={`mt-3 sm:mt-5 px-1 w-full gap-0.5 sm:gap-1 bg-card border-2 sm:border-4 ${styles.border} rounded-md flex flex-col flex-1 items-center font-gaegu`}
      >
        <h3
          className={`font-semibold mt-2 sm:mt-3 text-xl sm:text-3xl ${styles.text} text-center line-clamp-2`}
        >
          {name}
        </h3>

        <span
          className={`text-xs sm:text-s px-4 sm:px-10 py-0.5 rounded-sm font-semibold border ${
            isWarrior
              ? "bg-kfk-muted-yellow/30 text-kfk-brown border-kfk-brown"
              : "bg-blue-100 text-kfk-blue border-kfk-blue"
          }`}
        >
          {isWarrior ? "Warrior" : "Super Sib"}
        </span>

        <p className="text-xs sm:text-s font-semibold">{age} years old</p>

        {isWarrior ? (
          <p className="text-xs sm:text-s text-center font-semibold line-clamp-2 px-1">
            {diagnosis}
          </p>
        ) : (
          <p className="text-xs sm:text-s">&nbsp;</p>
        )}

        <div className="mb-2 sm:mb-3 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-s font-semibold text-muted-foreground">
          <GiftIcon
            className={`h-3 w-3 sm:h-4 sm:w-4 text-card ${styles.fill}`}
          />
          <span className="text-center">
            {giftsReceived} / {giftsRequested} Gifts Fulfilled
          </span>
        </div>
      </div>

      <div className="mt-2 sm:mt-4 w-full">
        <Button
          type="button"
          variant="outlineShadowOnly"
          className={`${styles.text} rounded-full border sm:border-2 ${styles.border} w-full font-gaegu font-semibold transition-shadow duration-200 text-xs sm:text-base py-1 sm:py-2`}
        >
          View More
        </Button>
      </div>
    </div>
  );
}
