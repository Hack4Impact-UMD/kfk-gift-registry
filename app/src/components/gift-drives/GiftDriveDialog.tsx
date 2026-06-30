import { useState } from "react";
import { DateTime } from "luxon";
import type { GiftDrive } from "common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateGiftDrive } from "@/hooks/mutations/useCreateGiftDrive";
import { useUpdateGiftDrive } from "@/hooks/mutations/useUpdateGiftDrive";

interface GiftDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: GiftDrive;
}

interface FormState {
  cycle: string;
  startDate: string;
  endDate: string;
}

function toInputValue(iso: string | undefined): string {
  if (!iso) return "";
  const dateTime = DateTime.fromISO(iso);
  return dateTime.isValid
    ? dateTime.toLocal().toFormat("yyyy-MM-dd'T'HH:mm")
    : "";
}

function toUtcIso(value: string): string | null {
  const dateTime = DateTime.fromISO(value, { zone: "local" });
  return dateTime.isValid ? dateTime.toUTC().toISO() : null;
}

function initialState(mode: "create" | "edit", initial?: GiftDrive): FormState {
  if (mode === "edit" && initial) {
    return {
      cycle: initial.cycle,
      startDate: toInputValue(initial.startDate),
      endDate: toInputValue(initial.endDate),
    };
  }

  return {
    cycle: "",
    startDate: "",
    endDate: "",
  };
}

export function GiftDriveDialog({
  open,
  onOpenChange,
  mode,
  initial,
}: GiftDriveDialogProps) {
  const { mutateAsync: createDrive, isPending: isCreating } =
    useCreateGiftDrive();
  const { mutateAsync: updateDrive, isPending: isUpdating } =
    useUpdateGiftDrive();
  const [form, setForm] = useState<FormState>(() =>
    initialState(mode, initial),
  );
  const [error, setError] = useState<string | null>(null);

  const isPending = isCreating || isUpdating;

  async function handleSave() {
    const cycle = form.cycle.trim();
    const startDate = toUtcIso(form.startDate);
    const endDate = toUtcIso(form.endDate);

    if (!cycle) {
      setError("Enter a cycle name.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Enter a valid start and end date.");
      return;
    }

    if (DateTime.fromISO(endDate) <= DateTime.fromISO(startDate)) {
      setError("End date must be after start date.");
      return;
    }

    setError(null);

    if (mode === "create") {
      await createDrive({ cycle, startDate, endDate });
    } else if (initial) {
      await updateDrive({ id: initial.id, cycle, startDate, endDate });
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New gift drive" : "Edit gift drive"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new drive for staff, forms, and storefront activity."
              : "Update the cycle and date window for this drive."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="gift-drive-cycle">Cycle</Label>
            <Input
              id="gift-drive-cycle"
              placeholder="Winter 2026"
              value={form.cycle}
              onChange={(e) => {
                setForm((current) => ({ ...current, cycle: e.target.value }));
                if (error) setError(null);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gift-drive-start-date">Start date</Label>
            <Input
              id="gift-drive-start-date"
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => {
                setForm((current) => ({
                  ...current,
                  startDate: e.target.value,
                }));
                if (error) setError(null);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gift-drive-end-date">End date</Label>
            <Input
              id="gift-drive-end-date"
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => {
                setForm((current) => ({
                  ...current,
                  endDate: e.target.value,
                }));
                if (error) setError(null);
              }}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isCreating
              ? "Creating…"
              : isUpdating
                ? "Saving…"
                : mode === "create"
                  ? "Create drive"
                  : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
