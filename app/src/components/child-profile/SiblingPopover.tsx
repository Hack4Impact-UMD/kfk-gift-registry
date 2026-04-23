import { useState } from "react";
import type { Child } from "../../../../common/src/types/child";
import { useChildGifts } from "@/hooks/queries/useChildGifts";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UserIcon } from "@/components/icons";
import DefaultPhoto from "@/assets/default-profile-photo.png";

export function SiblingPopover({ sibling }: { sibling: Child }) {
  const [open, setOpen] = useState(false);

  const { data: gifts = [], isLoading, error } = useChildGifts(sibling.id);

  const activeGifts = gifts.filter((g) => g.active);
  const totalGifts = activeGifts.length;
  const receivedGifts = activeGifts.filter(
    (g) => g.status === "RECEIVED",
  ).length;

  const isComplete = totalGifts > 0 && receivedGifts === totalGifts;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="p-0 -ml-2 -mr-6 border-transparent hover:bg-transparent data-[state=open]:bg-transparent"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <UserIcon className="size-10 p-1 border border-card shadow-lg bg-kfk-light-grey text-muted-foreground rounded-full hover:scale-105 transition" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 border-4 border-kfk-light-blue"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading gifts...</div>
        ) : error ? (
          <div className="text-sm text-kfk-red">Failed to load gifts</div>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={sibling.photoUrl ?? DefaultPhoto}
              alt={sibling.name}
              className="w-auto h-[96px] border-4 border-card rounded-xl shadow-xl"
            />

            <div className="flex flex-col gap-2">
              <p className="font-semibold text-xl">{sibling.name}</p>

              <p
                className={
                  sibling.category === "warrior"
                    ? "text-center text-kfk-brown bg-kfk-yellow/30 rounded-full border border-kfk-brown px-2"
                    : "text-center text-kfk-blue bg-kfk-light-blue/30 rounded-full border border-kfk-blue px-2"
                }
              >
                {sibling.category === "warrior" ? "Warrior" : "Super Sib"}
              </p>

              <p className="text-xs flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isComplete ? "bg-green-500" : "bg-yellow-400"
                  }`}
                />
                {receivedGifts} / {totalGifts} Gifts
              </p>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
