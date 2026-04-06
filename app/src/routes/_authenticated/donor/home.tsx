import { createFileRoute, useBlocker } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ExternalLink, Gift, ChevronDown, ChevronUp } from "lucide-react";
import DefaultProfile from "@/assets/default-profile-photo.png";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { HomeHeaderCard } from "@/components/donor/HomeHeaderCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

type GiftFormState = {
  ordered: boolean;
  delivered: boolean;
  receivedByFamily: boolean;
  receiptFileName: string | null;
  deliveryReceiptFileName: string | null;
  tracking: string;
  unclaimed: boolean;
  pendingUnclaim: boolean;
  changesSaved: boolean;
};

const COMMITTED_GIFTS: Array<CommittedGift> = [
  { id: "gift-uno", title: "Uno Card Game", productUrl: "https://www.amazon.com", listedPrice: 9.99, additionalInfo: "Classic family version" },
  { id: "gift-hues", title: "HUES and CUES - Color Guessing Board Game", productUrl: "https://www.amazon.com", listedPrice: 9.95, additionalInfo: "small; Color: Navy/Grey/White" },
];

const JANE_COMMITTED_GIFTS: Array<CommittedGift> = [
  { id: "gift-sorry", title: "Sorry! The Board Game", productUrl: "https://www.amazon.com", listedPrice: 9.99, additionalInfo: "Classic family version" },
  { id: "gift-lego", title: "Lego Disney Pixar Up", productUrl: "https://www.amazon.com", listedPrice: 19.95, additionalInfo: "medium; figurines" },
  { id: "gift-barbie", title: "Barbie Dreamhouse", productUrl: "https://www.amazon.com", listedPrice: 15.99, additionalInfo: "medium; pink figurines" },
];

const COMMITTED_CHILDREN: Array<CommittedChild> = [
  { id: "john-doe", firstName: "John", lastName: "Doe", photoUrl: DefaultProfile, category: "Warrior", gifts: COMMITTED_GIFTS },
  { id: "jane-doe", firstName: "Jane", lastName: "Doe", photoUrl: DefaultProfile, category: "Supersib", gifts: JANE_COMMITTED_GIFTS },
];

function createInitialGiftStates(gifts: Array<CommittedGift>): Record<string, GiftFormState> {
  return Object.fromEntries(
    gifts.map((g) => [g.id, {
      ordered: false, delivered: false, receivedByFamily: false,
      receiptFileName: null, deliveryReceiptFileName: null,
      tracking: "", unclaimed: false, changesSaved: true,
      pendingUnclaim: false
    }])
  );
}

function formatUsd(price: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

export function getBlueBackground(): CSSProperties {
  return {
    backgroundColor: "#0839b1",
    backgroundImage: `
      radial-gradient(circle at 20% 20%, #1a3fbf 25px, transparent 25px),
      radial-gradient(circle at 70% 10%, #1a3fbf 15px, transparent 15px),
      radial-gradient(circle at 50% 40%, #1a3fbf 35px, transparent 35px),
      radial-gradient(circle at 90% 35%, #1a3fbf 28px, transparent 28px),
      radial-gradient(circle at 10% 60%, #1a3fbf 30px, transparent 30px),
      radial-gradient(circle at 75% 65%, #1a3fbf 38px, transparent 38px),
      radial-gradient(circle at 35% 80%, #1a3fbf 32px, transparent 32px),
      radial-gradient(circle at 85% 85%, #1a3fbf 20px, transparent 20px),
      radial-gradient(circle at 55% 90%, #1a3fbf 25px, transparent 25px)
    `,
  };
}

function UnclaimDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to un-claim the gift?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible and will return the gift back to the storefront.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onCancel} className="bg-kfk-blue hover:bg-kfk-blue/80 text-white">
            Cancel
          </AlertDialogAction>
          <AlertDialogCancel onClick={onConfirm} className="border-kfk-blue text-kfk-blue hover:bg-kfk-blue/10">
            Yes, I am sure
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UnsavedChangesDialog({ open, onDiscard, onSave }: { open: boolean; onDiscard: () => void; onSave: () => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            Unsaved changes will be lost if you leave this page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onDiscard} className="bg-kfk-blue hover:bg-kfk-blue/80 text-white">
            Discard
          </AlertDialogAction>
          <AlertDialogCancel onClick={onSave} className="border-kfk-blue text-kfk-blue hover:bg-kfk-blue/10">
            Save Changes
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FileUploadRow({
  fileName,
  onFile,
  onClear,
  showClear = false,
}: {
  fileName: string | null;
  onFile: (name: string) => void;
  onClear: () => void;
  showClear?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-row items-center gap-4">
      <Label htmlFor={inputId} className="flex shrink-0 cursor-pointer flex-col gap-0 text-base font-medium leading-tight text-gray-800">
        <span>Attach</span>
        <span>Receipt</span>
      </Label>
      <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
        <input ref={inputRef} id={inputId} type="file" accept="image/*,.pdf" className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f.name); e.target.value = ''}} />
        <div className="flex items-center gap-2 w-full justify-end">
          <button type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-kfk-blue px-8 py-2 font-gaegu text-[18px] font-bold text-white transition-colors hover:bg-kfk-blue/80"
            onClick={() => inputRef.current?.click()}>
            Upload
          </button>
          {showClear && fileName && (
            <button type="button" onClick={onClear}
              className="text-gray-500 hover:text-gray-700 text-xl font-medium leading-none"
              aria-label="Remove file">
              ×
            </button>
          )}
        </div>
        {fileName && (
          <p className="max-w-[220px] truncate text-right text-xs text-gray-500">{fileName}</p>
        )}
      </div>
    </div>
  );
}

function ConfirmedBanner({ label }: { label: string }) {
  return (
    <div className="flex w-full justify-center">
      <div className="flex min-h-12 w-[92%] max-w-md flex-wrap items-center justify-center gap-2 rounded-xl bg-kfk-green px-3 py-2 font-gaegu text-[20px] font-bold text-white">
        <span>{label}</span>
        <span>✓</span>
      </div>
    </div>
  );
}

function GiftInformationCard({
  gift, state,
  onOrdered, onDelivered, onUndoDelivery,
  onReceipt, onDeliveryReceipt, onTrackingChange,
  onUnclaimRequest, onSave,
}: {
  gift: CommittedGift;
  state: GiftFormState;
  onOrdered: () => void;
  onDelivered: () => void;
  onUndoDelivery: () => void;
  onReceipt: (f: string | null) => void;
  onDeliveryReceipt: (f: string | null) => void;
  onTrackingChange: (v: string) => void;
  onUnclaimRequest: () => void;
  onSave: () => void;
}) {
  const [undoMode, setUndoMode] = useState(false);

  // Keeps track of the most recent saved states
  const [trackingNum, setTrackingNum] = useState(state.tracking);
  const [isDelivered, setIsDelivered] = useState(state.delivered);
  const [orderReceipt, setOrderReceipt] = useState(state.receiptFileName);
  const [orderDeliveryReceipt, setOrderDeliveryReceipt] = useState(state.deliveryReceiptFileName);

  if (state.receivedByFamily || state.unclaimed) return null;

  return (
    <div className={cn(
      "w-full overflow-hidden rounded-xl bg-white text-left transition-all",
      "shadow-[0_0_24px_rgba(15,23,42,0.12)]",
      "text-gray-900",
      // Highlight entire card in orange/yellow when undo mode is active
      undoMode && "ring-4 ring-amber-400 ring-offset-1",
    )}>
      <div className="space-y-4 p-4 md:p-5">

        <dl className="grid grid-cols-[minmax(7.5rem,auto)_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="shrink-0 font-bold">Gift Name</dt>
          <dd className="min-w-0">
            <a href={gift.productUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1.5 font-medium text-kfk-blue hover:underline">
              <span className="break-words">{gift.title}</span>
              <ExternalLink className="size-4 shrink-0 translate-y-px" aria-hidden />
            </a>
          </dd>
          <dt className="shrink-0 font-bold">Price</dt>
          <dd>{formatUsd(gift.listedPrice)}</dd>
          <dt className="shrink-0 font-bold">Additional Information</dt>
          <dd className="text-gray-800">{gift.additionalInfo}</dd>
        </dl>

        {undoMode && (
          <p className="text-center text-sm font-medium text-gray-700">
            Select necessary button(s) to undo or edit any unintended actions.
          </p>
        )}

        {state.ordered && (
          <div className="space-y-4 rounded-lg border-2 border-kfk-blue bg-white p-4">
            {!state.delivered ? (
              <>
                <p className="text-center text-base font-medium text-gray-900">Was the gift delivered?</p>
                <div className="flex w-full justify-center">
                  <Button type="button"
                    className="h-12 w-[92%] max-w-md rounded-xl bg-kfk-blue font-gaegu text-[20px] font-bold text-white hover:bg-kfk-blue/80"
                    onClick={() => {
                      onDelivered();
                      if (!undoMode) {
                        setIsDelivered(true);
                        onSave();
                      }
                    }}>
                    Yes, it was delivered!
                  </Button>
                </div>
              </>
            ) : undoMode ? (
              // In undo mode: show undo button instead of confirmed banner
              <div className="flex w-full justify-center">
                <Button type="button" variant="outline"
                  className="h-12 w-[92%] max-w-md rounded-xl border-2 border-kfk-blue font-gaegu text-[18px] font-bold text-kfk-blue hover:bg-kfk-blue/10"
                  onClick={() => { onUndoDelivery(); }}>
                  Undo Delivery Confirmation
                </Button>
                {state.pendingUnclaim && (
                  <p className="text-center text-xs text-amber-600 font-medium">
                    Un-claim pending — save to confirm
                  </p>
                )}
              </div>
            ) : (
              <ConfirmedBanner label="Gift Delivery Confirmed" />
            )}

            <Separator className="bg-gray-200" />
            <p className="text-center text-base text-gray-700">Optional, but helpful for us!</p>
            <FileUploadRow
              fileName={state.deliveryReceiptFileName}
              onFile={(n) => {
                onDeliveryReceipt(n); 
                if (!undoMode) {
                  onSave();
                  setOrderDeliveryReceipt(n);
                }
              }}
              onClear={() => onDeliveryReceipt(null)}
              showClear={undoMode}
            />
          </div>
        )}

        <div className="space-y-4 rounded-lg border-2 border-kfk-blue bg-white p-4">
          {!state.ordered ? (
            <>
              <p className="text-center text-base font-medium text-gray-900">Did you order the gift?</p>
              <div className="flex w-full justify-center">
                <Button type="button"
                  className="h-12 w-[92%] max-w-md rounded-xl bg-kfk-blue font-gaegu text-[20px] font-bold text-white hover:bg-kfk-blue/80"
                  onClick={() => {
                    onOrdered();
                    if (!undoMode){
                      setTrackingNum(state.tracking)
                      onSave();
                    }
                  }}>
                  Yes, I ordered the gift!
                </Button>
              </div>
            </>
          ) : undoMode ? (
            // In undo mode: show un-claim button instead of confirmed banner
            <div className="flex w-full justify-center">
              <Button type="button" variant="outline"
                className="h-12 w-[92%] max-w-md rounded-xl border-2 border-kfk-blue font-gaegu text-[18px] font-bold text-kfk-blue hover:bg-kfk-blue/10"
                onClick={onUnclaimRequest}>
                Un-Claim Gift
              </Button>
            </div>
          ) : (
            <ConfirmedBanner label="Gift Purchase Confirmed" />
          )}

          <Separator className="bg-gray-200" />
          <p className="text-center text-base text-gray-700">Optional, but helpful for us!</p>
          <FileUploadRow
            fileName={state.receiptFileName}
            onFile={(n) => {
                onReceipt(n); 
                if (!undoMode) {
                  onSave();
                  setOrderReceipt(n);
                }
              }}
            onClear={() => onReceipt(null)}
            showClear={undoMode}
          />

          <div className="flex flex-row justify-between gap-2">
            <Label htmlFor={`${gift.id}-tracking`} className="text-sm font-bold whitespace-nowrap text-gray-900">Tracking #</Label>
            {!state.ordered || undoMode ? (
              <Input
                id={`${gift.id}-tracking`}
                value={state.tracking}
                onChange={(e) => onTrackingChange(e.target.value)}
                placeholder="Enter tracking number"
                className="rounded-lg border-gray-300"
              />
            ) : <Label className="justify-self-end text-primary">{state.tracking}</Label>}

          </div>

          {/* Changes Saved */}
          {state.changesSaved && !undoMode && (
            <div className="flex justify-end">
              <span className="text-xs text-gray-500">Changes Saved</span>
            </div>
          )}
        </div>

        {!undoMode ? (
          <div className="flex justify-end pt-1">
            <Button type="button" variant="outline"
              className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setUndoMode(true)}>
              Undo Actions
            </Button>
          </div>
        ) : (
          <div className="flex justify-between pt-1">
            <Button type="button" variant="outline"
              className="border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => { if (isDelivered) onDelivered(); else onUndoDelivery(); onTrackingChange(trackingNum); onReceipt(orderReceipt); onDeliveryReceipt(orderDeliveryReceipt); onSave(); setUndoMode(false);}}>
              Cancel
            </Button>
            <Button type="button"
              className="bg-kfk-blue font-medium text-white hover:bg-kfk-blue/80"
              onClick={() => { onSave(); setUndoMode(false); setIsDelivered(state.delivered); setTrackingNum(state.tracking); setOrderReceipt(state.receiptFileName); setOrderDeliveryReceipt(state.deliveryReceiptFileName)}}>
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReceivedGiftsCard({ gifts, giftStates }: { gifts: Array<CommittedGift>; giftStates: Record<string, GiftFormState> }) {
  const received = gifts.filter((g) => giftStates[g.id]?.receivedByFamily);
  if (received.length === 0) return null;
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="space-y-3 p-5">
        <p className="border-b-1 border-b-[#126912] border-t-1 border-t-[#126912] py-2 -mx-5 text-center font-semibold text-[#126912] bg-green-100">The family received your gift(s).</p>
        {received.map((g) => (
          <div key={g.id} className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 text-sm">
            <span className="font-bold">Gift Name:</span>
            <span>{g.title}</span>
          </div>
        ))}
        <p className="pt-2 text-center font-bold italic text-gray-800">Thank you for your contribution!</p>
      </div>
    </div>
  );
}

function ChildDetailSection({ child, giftStates, onOrdered, onDelivered, onUndoDelivery, onReceipt, onDeliveryReceipt, onTrackingChange, onUnclaimRequest, onSave }: {
  child: CommittedChild;
  giftStates: Record<string, GiftFormState>;
  onOrdered: (id: string) => void;
  onDelivered: (id: string) => void;
  onUndoDelivery: (id: string) => void;
  onReceipt: (id: string, f: string | null) => void;
  onDeliveryReceipt: (id: string, f: string | null) => void;
  onTrackingChange: (id: string, v: string) => void;
  onUnclaimRequest: (id: string) => void;
  onSave: (id: string) => void;
}) {
  useEffect(() => {
    const element = document.getElementById(`${child.id}-gift`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
  }, []);

  return (
    <div className="mt-2 flex flex-col gap-4 text-left">
      <div id={`${child.id}-gift`} className="relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 items-center justify-center gap-2 bg-kfk-blue py-3 px-4 text-white">
        <Gift className="size-5 shrink-0" strokeWidth={1.75} />
        <span className="text-sm font-semibold md:text-base">{child.firstName}&apos;s Gift Information</span>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-6">
        <ReceivedGiftsCard gifts={child.gifts} giftStates={giftStates} />
        {[...child.gifts]
          .sort((a, b) => {
            const aDone = giftStates[a.id]?.ordered ?? false;
            const bDone = giftStates[b.id]?.ordered ?? false;
            if (aDone !== bDone) return aDone ? 1 : -1;
            return child.gifts.findIndex((x) => x.id === a.id) - child.gifts.findIndex((x) => x.id === b.id);
          })
          .map((gift) => (
            <GiftInformationCard
              key={gift.id}
              gift={gift}
              state={giftStates[gift.id]!}
              onOrdered={() => onOrdered(gift.id)}
              onDelivered={() => onDelivered(gift.id)}
              onUndoDelivery={() => onUndoDelivery(gift.id)}
              onReceipt={(f) => onReceipt(gift.id, f)}
              onDeliveryReceipt={(f) => onDeliveryReceipt(gift.id, f)}
              onTrackingChange={(v) => onTrackingChange(gift.id, v)}
              onUnclaimRequest={() => onUnclaimRequest(gift.id)}
              onSave={() => onSave(gift.id)}
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
  const [unclaimTargetId, setUnclaimTargetId] = useState<string | null>(null);

  // Single definition of set — marks dirty on every state change
  const set = useCallback((id: string, patch: Partial<GiftFormState>) => {
    setGiftStates((p) => ({ ...p, [id]: { ...p[id]!, ...patch, changesSaved: false } }));
  }, []);

  const handleOrdered = useCallback((id: string) => set(id, { ordered: true }), [set]);
  const handleDelivered = useCallback((id: string) => set(id, { delivered: true }), [set]);
  const handleUndoDelivery = useCallback((id: string) => set(id, { delivered: false }), [set]);
  const handleReceipt = useCallback((id: string, f: string | null) => set(id, { receiptFileName: f }), [set]);
  const handleDeliveryReceipt = useCallback((id: string, f: string | null) => set(id, { deliveryReceiptFileName: f }), [set]);
  const handleTrackingChange = useCallback((id: string, v: string) => set(id, { tracking: v }), [set]);

  // Single definition of handleSave — promotes pendingUnclaim and clears dirty
  const handleSave = useCallback((id: string) => {
    setGiftStates((p) => ({
      ...p,
      [id]: {
        ...p[id]!,
        changesSaved: true,
        unclaimed: p[id]!.pendingUnclaim, // promote pending to actual
      },
    }));
  }, []);

  const allSaved = Object.values(giftStates).every((gift) => gift.changesSaved);

  const handleUnclaimConfirm = useCallback(() => {
    if (!unclaimTargetId) return;
    set(unclaimTargetId, { pendingUnclaim: true });
    setUnclaimTargetId(null);
  }, [unclaimTargetId, set]);

  const visibleGifts = child.gifts.filter(
    (g) =>
      !giftStates[g.id]?.unclaimed &&
      !giftStates[g.id]?.pendingUnclaim &&
      !giftStates[g.id]?.receivedByFamily,
  );

  const blocker = useBlocker({ condition: !allSaved });

  return (
    <>
      <Card
        className="flex w-full flex-col gap-2 px-10 py-6 text-center text-white shadow-lg"
        style={getBlueBackground()}
      >
        <h3 className="mb-2 font-bold">
          Gifts you committed for {child.firstName}:
        </h3>
        <img
          src={child.photoUrl}
          className="mx-auto h-20 w-30 rounded-2xl border-3 border-white object-cover"
          alt={`${child.firstName} ${child.lastName}`}
        />
        <h2 className="font-gaegu text-2xl font-bold">
          {child.firstName} {child.lastName}
        </h2>
        <h3
          className={cn(
            "mx-auto w-28 rounded-full px-1 py-0.5 text-sm font-medium",
            child.category === "Warrior"
              ? "bg-[#FFF8C2] text-[#733C10]"
              : "bg-[#D4EAFF] text-kfk-blue",
          )}
        >
          {child.category}
        </h3>

        <div className="my-3 flex w-full flex-col gap-2">
          {visibleGifts.map((g) => {
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
                <span className="p-0 font-gaegu text-primary line-clamp-1">
                  {g.title}
                </span>
              </Card>
            );
          })}
        </div>

        <Button
          type="button"
          aria-expanded={detailsOpen}
          className="mx-auto flex items-center gap-1 rounded-full bg-white px-6 font-gaegu text-lg font-bold text-kfk-blue hover:bg-white/90"
          onClick={() => setDetailsOpen((o) => !o)}
        >
          {detailsOpen ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="size-4" />
            </>
          ) : (
            <>
              <span>Show More</span>
              <ChevronDown className="size-4" />
            </>
          )}
        </Button>
      </Card>

      {detailsOpen && (
        <ChildDetailSection
          child={child}
          giftStates={giftStates}
          onOrdered={handleOrdered}
          onDelivered={handleDelivered}
          onUndoDelivery={handleUndoDelivery}
          onReceipt={handleReceipt}
          onDeliveryReceipt={handleDeliveryReceipt}
          onTrackingChange={handleTrackingChange}
          onUnclaimRequest={(id) => setUnclaimTargetId(id)}
          onSave={handleSave}
        />
      )}

      <UnclaimDialog
        open={unclaimTargetId !== null}
        onCancel={() => setUnclaimTargetId(null)}
        onConfirm={handleUnclaimConfirm}
      />

      <UnsavedChangesDialog
        open={blocker.status === "blocked"}
        onDiscard={() => blocker.proceed?.()}
        onSave={() => blocker.reset?.()}
      />
    </>
  );
}

function RouteComponent() {
  const { auth } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-10 overflow-x-hidden p-5">
      <HomeHeaderCard displayName={auth.authUser.displayName ?? "Unnamed User"} />
      <div className="mx-auto w-full min-w-0 max-w-150 flex flex-col gap-6">
        {COMMITTED_CHILDREN.map((child) => (
          <ChildBlock key={child.id} child={child} />
        ))}
      </div>
    </div>
  );
}
