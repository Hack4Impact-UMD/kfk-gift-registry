import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ExternalLink, Gift } from "lucide-react";
import { CheckmarkIcon } from "@/components/icons/CheckmarkIcon";
import DefaultProfile from "@/assets/default-profile-photo.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { HomeHeaderCard } from "@/components/donor/HomeHeaderCard";

export const Route = createFileRoute("/_authenticated/donor/home")({
  component: RouteComponent,
});

type CommittedGift = {
  id: string;
  title: string;
  productUrl: string;
  listedPrice: number;
  additionalInfo: string;
};

type ChildStatus = "Warrior" | "Supersib";

type CommittedChild = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  category: ChildStatus;
  gifts: Array<CommittedGift>;
};

const COMMITTED_GIFTS: Array<CommittedGift> = [
  {
    id: "gift-uno",
    title: "Uno Card Game",
    productUrl: "https://www.amazon.com",
    listedPrice: 9.99,
    additionalInfo: "Classic family version",
  },
  {
    id: "gift-hues",
    title: "HUES and CUES - Color Guessing Board Game",
    productUrl: "https://www.amazon.com",
    listedPrice: 9.95,
    additionalInfo: "small; Color: Navy/Grey/White",
  },
];

const JANE_COMMITTED_GIFTS: Array<CommittedGift> = [
  {
    id: "gift-sorry",
    title: "Sorry! The Board Game",
    productUrl: "https://www.amazon.com",
    listedPrice: 9.99,
    additionalInfo: "Classic family version",
  },
  {
    id: "gift-lego",
    title: "Lego Disney Pixar Up",
    productUrl: "https://www.amazon.com",
    listedPrice: 19.95,
    additionalInfo: "medium; figurines",
  },
  {
    id: "gift-barbie",
    title: "Barbie Dreamhouse",
    productUrl: "https://www.amazon.com",
    listedPrice: 15.99,
    additionalInfo: "medium; pink figurines",
  },
];

const COMMITTED_CHILDREN: Array<CommittedChild> = [
  {
    id: "john-doe",
    firstName: "John",
    lastName: "Doe",
    photoUrl: DefaultProfile,
    category: "Warrior",
    gifts: COMMITTED_GIFTS,
  },
  {
    id: "jane-doe",
    firstName: "Jane",
    lastName: "Doe",
    photoUrl: DefaultProfile,
    category: "Supersib",
    gifts: JANE_COMMITTED_GIFTS,
  },
];

type GiftFormState = {
  ordered: boolean;
  delivered: boolean;
  receivedByFamily: boolean;
  receiptFileName: string | null;
  deliveryReceiptFileName: string | null;
  tracking: string;
  unclaimed: boolean;
};

function createInitialGiftStates(
  gifts: Array<CommittedGift>,
): Record<string, GiftFormState> {
  return Object.fromEntries(
    gifts.map((g) => [
      g.id,
      {
        ordered: false,
        delivered: false,
        receivedByFamily: false,
        receiptFileName: null,
        deliveryReceiptFileName: null,
        tracking: "",
        unclaimed: false,
      },
    ]),
  );
}

function formatUsd(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function getBlueBackground(): CSSProperties {
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

function GiftInformationCard({
  gift,
  state,
  onOrdered,
  onReceipt,
  onTrackingChange,
}: {
  gift: CommittedGift;
  state: GiftFormState;
  onOrdered: () => void;
  onReceipt: (fileName: string | null) => void;
  onTrackingChange: (value: string) => void;
}) {
  const receiptInputId = useId();
  const receiptInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("w-full overflow-hidden rounded-xl bg-white text-left", "shadow-[0_0_24px_rgba(15,23,42,0.12)]", "text-gray-900")}>
      <div className="space-y-4 p-4 md:p-5">
        <dl className="grid grid-cols-[minmax(7.5rem,auto)_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="shrink-0 font-bold text-gray-900">Gift Name</dt>
          <dd className="min-w-0">
            <a href={gift.productUrl} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 font-medium text-kfk-blue hover:underline">
              <span className="break-words">{gift.title}</span>
              <ExternalLink className="size-4 shrink-0 translate-y-px" aria-hidden />
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </dd>

          <dt className="shrink-0 font-bold text-gray-900">Price</dt>
          <dd className="min-w-0">{formatUsd(gift.listedPrice)}</dd>

          <dt className="shrink-0 font-bold text-gray-900">Additional Information</dt>
          <dd className="min-w-0 text-gray-800">{gift.additionalInfo}</dd>
        </dl>

        <div className="space-y-4 rounded-lg border-2 border-kfk-blue bg-white p-4">
          {!state.ordered ? (
            <>
              <p className="text-center text-base font-medium text-gray-900">
                Did you order the gift?
              </p>
              <div className="flex w-full justify-center">
                <Button
                  type="button"
                  className="h-12 w-[92%] max-w-md rounded-xl font-gaegu text-[20px] font-bold text-white"
                  onClick={onOrdered}
                >
                  Yes, I ordered the gift!
                </Button>
              </div>
            </>
          ) : (
            <div className="flex w-full justify-center">
              <div className="flex min-h-12 w-[92%] max-w-md flex-wrap items-center justify-center gap-2 rounded-xl bg-kfk-green px-3 py-2 font-gaegu text-[20px] font-bold text-white">
                <span className="text-center text-balance">
                  Gift Purchase Confirmed
                </span>
                <CheckmarkIcon className="size-6 shrink-0" aria-hidden />
              </div>
            </div>
          )}

          <Separator className="bg-gray-200" />

          <p className="text-center text-base text-gray-700">
            Optional, but helpful for us!
          </p>

          <div className="flex flex-row items-center gap-4">
            <Label htmlFor={receiptInputId} className="flex shrink-0 cursor-pointer flex-col gap-0 text-base font-medium leading-tight text-gray-800">
              <span>Attach</span>
              <span>Receipt</span>
            </Label>
            <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
              <input
                ref={receiptInputRef}
                id={receiptInputId}
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  onReceipt(file ? file.name : null);
                }}
              />
              <button
                type="button"
                className="inline-flex min-h-10 w-[92%] max-w-sm items-center justify-center rounded-xl border-0 bg-kfk-blue px-5 py-2 font-gaegu text-[20px] font-bold text-white hover:bg-kfk-blue/90"
                onClick={() => receiptInputRef.current?.click()}
              >
                Upload
              </button>
              {state.receiptFileName ? (
                <p className="max-w-full truncate self-end text-right text-xs text-gray-500">
                  {state.receiptFileName}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${gift.id}-tracking`} className="text-sm font-bold text-gray-900">
              Tracking #
            </Label>
            <Input
              id={`${gift.id}-tracking`}
              value={state.tracking}
              onChange={(e) => onTrackingChange(e.target.value)}
              placeholder="Enter tracking number"
              className="rounded-lg border-gray-300"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50"
          >
            Undo Actions
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChildDetailSection({
  child,
  giftStates,
  onOrdered,
  onReceipt,
  onTrackingChange,
}: {
  child: CommittedChild;
  giftStates: Record<string, GiftFormState>;
  onOrdered: (giftId: string) => void;
  onReceipt: (giftId: string, fileName: string | null) => void;
  onTrackingChange: (giftId: string, value: string) => void;
}) {
  return (
    <div
      className="mt-6 flex flex-col gap-4 text-left"
      aria-label={`${child.firstName}'s gift details`}
    >
      <div
        id={`${child.id}-gift`}
        className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 items-center justify-center gap-2 bg-kfk-blue py-3 px-4 text-white"
      >
        <Gift className="size-5 shrink-0 text-white" strokeWidth={1.75} />
        <span className="text-sm font-semibold md:text-base">
          {child.firstName}&apos;s Gift Information
        </span>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-6">
        {[...child.gifts]
          .sort((a, b) => {
            const aDone = giftStates[a.id]?.ordered ?? false;
            const bDone = giftStates[b.id]?.ordered ?? false;
            if (aDone !== bDone) return aDone ? 1 : -1;
            return (
              child.gifts.findIndex((x) => x.id === a.id) -
              child.gifts.findIndex((x) => x.id === b.id)
            );
          })
          .map((gift) => (
            <GiftInformationCard
              key={gift.id}
              gift={gift}
              state={giftStates[gift.id]!}
              onOrdered={() => onOrdered(gift.id)}
              onReceipt={(name) => onReceipt(gift.id, name)}
              onTrackingChange={(v) => onTrackingChange(gift.id, v)}
            />
          ))}
      </div>
    </div>
  );
}

function ChildBlock({ child }: { child: CommittedChild }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [giftStates, setGiftStates] = useState<Record<string, GiftFormState>>(
    createInitialGiftStates(child.gifts),
  );

  const handleOrdered = useCallback((giftId: string) => {
    setGiftStates((prev) => ({
      ...prev,
      [giftId]: {
        ...prev[giftId]!,
        ordered: true,
      },
    }));
  }, []);

  const handleReceipt = useCallback(
    (giftId: string, fileName: string | null) => {
      setGiftStates((prev) => ({
        ...prev,
        [giftId]: { ...prev[giftId]!, receiptFileName: fileName },
      }));
    },
    [],
  );

  const handleTrackingChange = useCallback((giftId: string, value: string) => {
    setGiftStates((prev) => ({
      ...prev,
      [giftId]: { ...prev[giftId]!, tracking: value },
    }));
  }, []);

  useEffect(() => {
    if (detailsOpen) {
      const element = document.getElementById(`${child.id}-gift`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [detailsOpen, child.id]);

  return (
    <>
      <Card
        className="flex w-full flex-col gap-2 px-10 text-center text-white shadow-lg"
        style={getBlueBackground()}
      >
        <h3 className="mb-2 font-bold">
          Gifts you&apos;ve committed for {child.firstName}:
        </h3>
        <img
          src={DefaultProfile}
          className="mx-auto h-20 w-30 rounded-2xl border-3 border-white object-cover"
          alt=""
        />
        <h2 className="font-gaegu text-2xl font-bold">
          {child.firstName + " " + child.lastName}
        </h2>
        <h3
          className={`mx-auto w-28 rounded-full ${
            child.category === "Warrior"
              ? "bg-[#FFF8C2] text-[#733C10]"
              : "bg-[#D4EAFF] text-kfk-blue"
          } px-1 py-0.5`}
        >
          {child.category}
        </h3>

        <div className="my-3 flex w-full flex-col gap-2">
          {child.gifts.map((g) => {
            const purchased = giftStates[g.id]?.ordered ?? false;
            return (
              <Card key={g.id} className="flex flex-col gap-2 rounded-lg p-2">
                <h3
                  className={cn(
                    "my-0 rounded-full text-center font-semibold",
                    purchased
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-kfk-red",
                  )}
                >
                  {purchased ? "Purchased" : "Not Purchased"}
                </h3>
                <span className="p-0 font-gaegu text-primary">
                  {g.title}
                </span>
              </Card>
            );
          })}
        </div>

        <Button
          type="button"
          aria-expanded={detailsOpen}
          className="mx-auto w-40 rounded-full bg-white font-gaegu text-xl font-bold text-kfk-blue"
          onClick={() => setDetailsOpen((o) => !o)}
        >
          {detailsOpen ? "View Less" : "View More"}
        </Button>
      </Card>

      {detailsOpen && (
        <ChildDetailSection
          child={child}
          giftStates={giftStates}
          onOrdered={handleOrdered}
          onReceipt={handleReceipt}
          onTrackingChange={handleTrackingChange}
        />
      )}
    </>
  );
}

function RouteComponent() {
  const { auth } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-10 overflow-x-hidden p-5">
      <HomeHeaderCard displayName={auth.authUser.displayName ?? "Unnamed User"} />

      <div className="mx-auto w-full min-w-0 max-w-150">
        {COMMITTED_CHILDREN.map((child) => (
          <ChildBlock key={child.id} child={child} />
        ))}
      </div>
    </div>
  );
}
