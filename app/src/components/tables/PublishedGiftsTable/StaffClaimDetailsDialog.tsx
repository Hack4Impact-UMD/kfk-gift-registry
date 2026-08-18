import { useState } from "react";
import type { Address, GiftStatus } from "common";
import { GiftStatusSchema } from "common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GIFT_STATUS_CONFIG } from "./GiftStatusBadge";
import { useStaffClaimDialog } from "./useStaffClaimDialog";

type StaffClaim = ReturnType<typeof useStaffClaimDialog>;

type StaffClaimDetailsDialogProps = {
  giftId: string;
  giftName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatAddress(address: Address) {
  return [
    address.street,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.zipCode}`,
  ]
    .filter(Boolean)
    .join(", ");
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <p className="text-sm">
      <span className="font-semibold">{label}:</span>{" "}
      <span className="text-muted-foreground">{value || "N/A"}</span>
    </p>
  );
}

/**
 * Lifecycle controls for a KFK claim. Rendered only once the claim has loaded,
 * so the tracking input can seed itself from the loaded value with a plain
 * `useState` initializer (no effect, no setState during render).
 */
function ClaimLifecycleControls({
  claim,
  initialTrackingNumber,
}: {
  claim: StaffClaim;
  initialTrackingNumber: string;
}) {
  const [trackingInput, setTrackingInput] = useState(initialTrackingNumber);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={!claim.canMarkPurchased || claim.isMutating}
          onClick={claim.markPurchased}
        >
          Mark Purchased
        </Button>
        <Button
          size="sm"
          disabled={!claim.canMarkDelivered || claim.isMutating}
          onClick={claim.markDelivered}
        >
          Mark Delivered
        </Button>
        {claim.canUnclaim && (
          <Button
            size="sm"
            variant="destructive"
            disabled={claim.isMutating}
            onClick={claim.unclaim}
          >
            Unclaim
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="tracking-number" className="text-sm font-semibold">
          Tracking Number
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="tracking-number"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="Enter tracking number"
            disabled={!claim.canEditTracking || claim.isMutating}
          />
          <Button
            size="sm"
            disabled={
              !claim.canEditTracking ||
              claim.isMutating ||
              trackingInput.trim() === initialTrackingNumber
            }
            onClick={() => claim.saveTracking(trackingInput.trim())}
          >
            Save
          </Button>
        </div>
        {!claim.canEditTracking && (
          <p className="text-xs text-muted-foreground">
            Mark the gift as purchased to add a tracking number.
          </p>
        )}
      </div>

      {claim.mutationError && (
        <p className="text-sm text-destructive">
          {claim.mutationError.message}
        </p>
      )}
    </section>
  );
}

/**
 * Manual status override, available for both KFK and donor claims.
 */
function GiftStatusOverride({ claim }: { claim: StaffClaim }) {
  return (
    <section className="space-y-1">
      <label htmlFor="status-override" className="text-sm font-semibold">
        Status
      </label>
      <Select
        value={claim.status}
        disabled={claim.isMutating}
        onValueChange={(value) => claim.setStatus(value as GiftStatus)}
      >
        <SelectTrigger id="status-override" className="w-full border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GiftStatusSchema.options.map((status) => (
            <SelectItem key={status} value={status}>
              {GIFT_STATUS_CONFIG[status].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!claim.canManage && (
        <p className="text-xs text-muted-foreground">
          This gift was claimed by a donor. Its purchase/delivery is normally
          confirmed from the donor&apos;s account; use this to correct the
          status manually if needed.
        </p>
      )}
      {claim.mutationError && (
        <p className="text-sm text-destructive">
          {claim.mutationError.message}
        </p>
      )}
    </section>
  );
}

export function StaffClaimDetailsDialog({
  giftId,
  giftName,
  open,
  onOpenChange,
}: StaffClaimDetailsDialogProps) {
  const claim = useStaffClaimDialog(giftId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gift Claim Details</DialogTitle>
          <DialogDescription>{giftName}</DialogDescription>
        </DialogHeader>

        {claim.isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-6" />
          </div>
        ) : claim.error || !claim.details ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-destructive">
              Failed to load claim details.
            </p>
            <Button variant="outline" size="sm" onClick={() => claim.refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Shipping info */}
            <section className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Shipping Info
              </h3>
              <InfoRow label="Child" value={claim.details.child?.name} />
              {claim.details.family ? (
                <>
                  <InfoRow
                    label="Contact"
                    value={claim.details.family.contactName}
                  />
                  <InfoRow label="Phone" value={claim.details.family.phone} />
                  <InfoRow label="Email" value={claim.details.family.email} />
                  <InfoRow
                    label="Address"
                    value={formatAddress(claim.details.family.address)}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No family shipping info available.
                </p>
              )}
            </section>

            {claim.details.donor && (
              <>
                <Separator />

                {/* Donor info */}
                <section className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    Donor Info
                  </h3>
                  <InfoRow label="Name" value={claim.details.donor.name} />
                  <InfoRow label="Phone" value={claim.details.donor.phone} />
                </section>
              </>
            )}

            {/* Status override + (KFK-only) lifecycle controls */}
            <GiftStatusOverride claim={claim} />
            {claim.canManage && (
              <ClaimLifecycleControls
                claim={claim}
                initialTrackingNumber={
                  claim.details.claim?.purchaseConfirmation?.trackingNumber ??
                  ""
                }
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
