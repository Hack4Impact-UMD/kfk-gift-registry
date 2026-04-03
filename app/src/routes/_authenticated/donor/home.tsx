import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useCallback, useId, useRef, useState } from "react";
import { ExternalLink, Gift } from "lucide-react";
import { CheckmarkIcon } from "@/components/icons/CheckmarkIcon";
import RedGift from "@/assets/red-gift.png";
import DefaultProfile from "@/assets/default-profile-photo.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

/** Placeholder data until donor commitments are loaded from the backend */
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

type GiftFormState = {
  orderedConfirmed: boolean;
  receiptFileName: string | null;
  tracking: string;
  showSaved: boolean;
};

function createInitialGiftStates(): Record<string, GiftFormState> {
  return Object.fromEntries(
    COMMITTED_GIFTS.map((g) => [
      g.id,
      {
        orderedConfirmed: false,
        receiptFileName: null,
        tracking: "",
        showSaved: false,
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

function getBlueBackground(): CSSProperties {
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
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl bg-white text-left",
        "shadow-[0_0_24px_rgba(15,23,42,0.12)]",
        "text-gray-900",
      )}
    >
      <div className="space-y-4 p-4 md:p-5">
        <dl className="grid grid-cols-[minmax(7.5rem,auto)_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="shrink-0 font-bold text-gray-900">Gift Name</dt>
          <dd className="min-w-0">
            <a
              href={gift.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1.5 font-medium text-kfk-blue hover:underline"
            >
              <span className="break-words">{gift.title}</span>
              <ExternalLink
                className="size-4 shrink-0 translate-y-px"
                aria-hidden
              />
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </dd>

          <dt className="shrink-0 font-bold text-gray-900">Price</dt>
          <dd className="min-w-0">{formatUsd(gift.listedPrice)}</dd>

          <dt className="shrink-0 font-bold text-gray-900">
            Additional Information
          </dt>
          <dd className="min-w-0 text-gray-800">{gift.additionalInfo}</dd>
        </dl>

        <div className="space-y-4 rounded-lg border-2 border-kfk-blue bg-white p-4">
          {!state.orderedConfirmed ? (
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
              <div
                className="flex min-h-12 w-[92%] max-w-md flex-wrap items-center justify-center gap-2 rounded-xl bg-kfk-green px-3 py-2 font-gaegu text-[20px] font-bold text-white"
                role="status"
                aria-live="polite"
              >
                <span className="text-center text-balance">
                  Gift purchase confirmed
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
            <Label
              htmlFor={receiptInputId}
              className="flex shrink-0 cursor-pointer flex-col gap-0 text-base font-medium leading-tight text-gray-800"
            >
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
                className="inline-flex min-h-10 w-[92%] max-w-sm items-center justify-center rounded-xl border-0 bg-kfk-blue px-5 py-2 font-gaegu text-[20px] font-bold leading-tight text-white shadow-none outline-none transition-colors hover:bg-kfk-blue/90 focus-visible:ring-2 focus-visible:ring-kfk-blue focus-visible:ring-offset-2"
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
            <Label
              htmlFor={`${gift.id}-tracking`}
              className="text-sm font-bold text-gray-900"
            >
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

          <div className="flex justify-end">
            {state.showSaved ? (
              <span className="text-xs text-gray-500">Changes Saved</span>
            ) : null}
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

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [giftStates, setGiftStates] = useState<Record<string, GiftFormState>>(
    createInitialGiftStates,
  );

  const childDisplayName = "John Doe";
  const childFirstName = childDisplayName.split(/\s+/)[0] ?? "Child";

  const handleOrdered = useCallback((giftId: string) => {
    setGiftStates((prev) => ({
      ...prev,
      [giftId]: {
        ...prev[giftId]!,
        orderedConfirmed: true,
        showSaved: true,
      },
    }));
  }, []);

  const handleReceipt = useCallback(
    (giftId: string, fileName: string | null) => {
      setGiftStates((prev) => ({
        ...prev,
        [giftId]: { ...prev[giftId]!, receiptFileName: fileName, showSaved: true },
      }));
    },
    [],
  );

  const handleTrackingChange = useCallback((giftId: string, value: string) => {
    setGiftStates((prev) => ({
      ...prev,
      [giftId]: { ...prev[giftId]!, tracking: value, showSaved: true },
    }));
  }, []);

  return (
    <div className="flex flex-col gap-10 overflow-x-hidden p-5">
      <Card
        className="mx-auto flex w-full max-w-150 flex-row justify-center px-5 py-7 text-white"
        style={getBlueBackground()}
      >
        <div className="flex flex-col">
          <h1 className="font-gaegu text-3xl font-bold">
            Welcome {auth.authUser.displayName}!
          </h1>
          <p className="text-xs italic">
            Your Contribution Makes a Difference. Thank You for your support!
          </p>
        </div>
        <img className="w-20" src={RedGift} alt="" />
      </Card>

      <div className="mx-auto w-full min-w-0 max-w-150">
        <Card
          className="flex w-full flex-col gap-2 px-10 text-center text-white shadow-lg"
          style={getBlueBackground()}
        >
          <h3 className="mb-2 font-bold">
            Gifts you&apos;ve committed for {childFirstName}:
          </h3>
          <img
            src={DefaultProfile}
            className="mx-auto h-20 w-30 rounded-2xl border-3 border-white object-cover"
            alt=""
          />
          <h2 className="font-gaegu text-2xl font-bold">{childDisplayName}</h2>
          <h3 className="mx-auto w-28 rounded-full bg-[#FFF8C2] px-1 py-0.5 text-[#733C10]">
            Warrior
          </h3>

          <div className="my-3 flex w-full flex-col gap-2">
            {COMMITTED_GIFTS.map((g) => {
              const purchased = giftStates[g.id]?.orderedConfirmed ?? false;
              return (
                <Card
                  key={g.id}
                  className="flex flex-col gap-2 rounded-lg p-2"
                >
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
                  <span className="p-0 font-gaegu text-primary">{g.title}</span>
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

        {detailsOpen ? (
          <div
            className="mt-6 flex flex-col gap-4 text-left"
            aria-label={`${childFirstName}'s gift details`}
          >
            {/* Full-bleed bar; column stays max-w-150 for cards below */}
            <div className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 items-center justify-center gap-2 bg-kfk-blue py-3 px-4 text-white">
              <Gift className="size-5 shrink-0 text-white" strokeWidth={1.75} aria-hidden />
              <span className="text-sm font-semibold md:text-base">
                {childFirstName}&apos;s Gift Information
              </span>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-6">
              {[...COMMITTED_GIFTS]
                .sort((a, b) => {
                  const aDone = giftStates[a.id]?.orderedConfirmed ?? false;
                  const bDone = giftStates[b.id]?.orderedConfirmed ?? false;
                  if (aDone !== bDone) return aDone ? 1 : -1;
                  return (
                    COMMITTED_GIFTS.findIndex((x) => x.id === a.id) -
                    COMMITTED_GIFTS.findIndex((x) => x.id === b.id)
                  );
                })
                .map((gift) => (
                  <GiftInformationCard
                    key={gift.id}
                    gift={gift}
                    state={giftStates[gift.id]!}
                    onOrdered={() => handleOrdered(gift.id)}
                    onReceipt={(name) => handleReceipt(gift.id, name)}
                    onTrackingChange={(v) => handleTrackingChange(gift.id, v)}
                  />
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
