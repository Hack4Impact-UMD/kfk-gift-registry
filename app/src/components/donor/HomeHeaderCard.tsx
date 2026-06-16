import { Card } from "../ui/card";
import { getBlueBackground } from "@/components/donor/home/utils";
import RedGift from "@/assets/red-gift.png";

type HeaderProps = {
  displayName: string;
};

export function HomeHeaderCard({ displayName }: HeaderProps) {
  return (
    <Card
      className="flex w-full flex-col items-start justify-between gap-5 px-6 py-7 text-white md:flex-row md:items-center md:px-8"
      style={getBlueBackground()}
    >
      <div className="flex flex-col gap-2 text-left">
        <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
          Donor Dashboard
        </span>
        <h1 className="font-gaegu text-3xl font-bold md:text-4xl">
          Welcome {displayName}!
        </h1>
        <p className="max-w-xl text-sm italic text-white/90">
          Your Contribution Makes a Difference. Thank You for your support!
        </p>
      </div>
      <img
        className="w-18 self-center md:w-20 md:self-auto"
        src={RedGift}
        alt=""
      />
    </Card>
  );
}
