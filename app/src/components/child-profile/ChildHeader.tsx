import { Child } from "../../../../common/src/types/child";
import { Button } from "../ui/button";

export function ChildHeader({ child }: { child: Child }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <h1 className="text-3xl">{child.name}</h1>
        <p 
          className={
            child.category === "warrior"
              ? "text-center text-kfk-brown bg-kfk-yellow/30 rounded-full border border-kfk-brown px-4"
              : "text-center text-kfk-blue bg-kfk-light-blue/30 rounded-full border border-kfk-blue px-4"
          }
        >
          {child.category == "warrior" ? "Warrior" : "Super Sib"}
        </p>
      </div>

      <div className="flex gap-2">
        <Button>Edit</Button>
        <Button variant="destructive">Unpublish</Button>
      </div>
    </div>
  );
}