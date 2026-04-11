import { Card } from "../ui/card";
import { getBlueBackground } from "@/routes/_authenticated/donor/home";
import RedGift from "@/assets/red-gift.png";

type HeaderProps = {
  displayName: string;
};

export function HomeHeaderCard({ displayName }: HeaderProps) {
  return (
    <Card
      className="flex items-center w-full max-w-150 flex-row justify-center px-5 py-7 text-white"
      style={getBlueBackground()}
    >
      <div className="flex flex-col">
        <h1 className="font-gaegu text-3xl font-bold">
          Welcome {displayName}!
        </h1>
        <p className="text-xs italic">
          Your Contribution Makes a Difference. Thank You for your support!
        </p>
      </div>
      <img className="w-20" src={RedGift} alt="" />
    </Card>
  );
}
