import { useState } from "react";
import { format } from "date-fns";
import { DateTime } from "luxon";
import type { GiftDrive } from "common";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "@/components/icons";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateGiftDrive } from "@/hooks/mutations/useCreateGiftDrive";
import { useUpdateGiftDrive } from "@/hooks/mutations/useUpdateGiftDrive";
import { cn } from "@/lib/utils";

interface GiftDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: GiftDrive;
}

interface FormState {
  cycle: string;
  dateRange: DateRange | undefined;
}

function toPickerDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const dateTime = DateTime.fromISO(iso);
  return dateTime.isValid
    ? dateTime.toLocal().startOf("day").toJSDate()
    : undefined;
}

function toUtcIso(
  date: Date | undefined,
  boundary: "start" | "end",
): string | null {
  if (!date) return null;
  const dateTime = DateTime.fromJSDate(date, { zone: "local" });
  const normalized =
    boundary === "start" ? dateTime.startOf("day") : dateTime.endOf("day");

  return normalized.isValid ? normalized.toUTC().toISO() : null;
}

function isSameLocalDay(date: Date, iso: string) {
  const selected = DateTime.fromJSDate(date, { zone: "local" });
  const existing = DateTime.fromISO(iso);

  if (!selected.isValid || !existing.isValid) {
    return false;
  }

  return selected.hasSame(existing.toLocal(), "day");
}

function formatDateRange(dateRange: DateRange | undefined) {
  if (!dateRange?.from) {
    return "Pick a date range";
  }

  if (!dateRange.to) {
    return format(dateRange.from, "LLL d, y");
  }

  return `${format(dateRange.from, "LLL d, y")} - ${format(
    dateRange.to,
    "LLL d, y",
  )}`;
}

function toUtcDateRange(dateRange: DateRange | undefined) {
  if (!dateRange?.from || !dateRange?.to) {
    return { startDate: null, endDate: null };
  }

  return {
    startDate: toUtcIso(dateRange.from, "start"),
    endDate: toUtcIso(dateRange.to, "end"),
  };
}

function getEndDateForSave(
  endDate: Date | undefined,
  originalEndDate?: string | null,
) {
  if (!endDate) return null;
  if (originalEndDate && isSameLocalDay(endDate, originalEndDate)) {
    return originalEndDate;
  }
  return toUtcIso(endDate, "end");
}

function initialState(mode: "create" | "edit", initial?: GiftDrive): FormState {
  if (mode === "edit" && initial) {
    const from = toPickerDate(initial.startDate);
    const to = toPickerDate(initial.endDate);

    return {
      cycle: initial.cycle,
      dateRange: from && to ? { from, to } : undefined,
    };
  }

  return {
    cycle: "",
    dateRange: undefined,
  };
}

export function GiftDriveDialog({
  open,
  onOpenChange,
  mode,
  initial,
}: GiftDriveDialogProps) {
  const isMobile = useIsMobile();
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
    const { startDate } = toUtcDateRange(form.dateRange);
    const endDate = getEndDateForSave(
      form.dateRange?.to,
      mode === "edit" ? initial?.endDate : undefined,
    );

    if (!cycle) {
      setError("Enter a cycle name.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Select a start and end date.");
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
            <Label>Drive dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.dateRange?.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="size-4 shrink-0" />
                  {formatDateRange(form.dateRange)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <DayPicker
                  mode="range"
                  selected={form.dateRange}
                  numberOfMonths={isMobile ? 1 : 2}
                  defaultMonth={form.dateRange?.from}
                  onSelect={(dateRange) => {
                    setForm((current) => ({
                      ...current,
                      dateRange,
                    }));
                    if (error) setError(null);
                  }}
                  resetOnSelect
                />
              </PopoverContent>
            </Popover>
          </div>

          <p className="text-xs text-muted-foreground">
            Drive dates cannot overlap. Only one drive can be active at a time.
          </p>

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
