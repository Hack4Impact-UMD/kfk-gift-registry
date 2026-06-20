import { useState } from "react";
import type { FormLink, GiftDrive } from "common";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateFormLink } from "@/hooks/mutations/useCreateFormLink";
import { useUpdateFormLink } from "@/hooks/mutations/useUpdateFormLink";
import { useDeleteFormLink } from "@/hooks/mutations/useDeleteFormLink";
import { DrivePicker } from "./DrivePicker";
import { driveLabel, formLinkName } from "./formLinkUtils";

interface FormLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drives: Array<GiftDrive>;
  mode: "create" | "edit";
  /** The link being edited. Required for edit mode. */
  initial?: FormLink;
  /** Pre-selected drive for create mode. */
  defaultDriveId?: string;
}

interface FormState {
  name: string;
  driveId: string;
  active: boolean;
  showOnStorefront: boolean;
}

function initialState(
  mode: "create" | "edit",
  initial?: FormLink,
  defaultDriveId?: string,
): FormState {
  if (mode === "edit" && initial) {
    return {
      name: initial.name ?? "",
      driveId: initial.driveId,
      active: initial.active,
      showOnStorefront: initial.showOnStorefront,
    };
  }
  return {
    name: "",
    driveId: defaultDriveId ?? "",
    active: true,
    showOnStorefront: false,
  };
}

export function FormLinkDialog({
  open,
  onOpenChange,
  drives,
  mode,
  initial,
  defaultDriveId,
}: FormLinkDialogProps) {
  const { mutateAsync: createLink, isPending: isCreating } = useCreateFormLink();
  const { mutateAsync: updateLink, isPending: isUpdating } = useUpdateFormLink();
  const { mutateAsync: deleteLink, isPending: isDeleting } = useDeleteFormLink();

  // Seeded once per mount. The parent gives this component a `key` tied to the
  // link/drive being edited so it remounts (and reseeds) when the subject changes.
  const [form, setForm] = useState<FormState>(() =>
    initialState(mode, initial, defaultDriveId),
  );

  const isPending = isCreating || isUpdating || isDeleting;
  const selectedDrive = drives.find((d) => d.id === form.driveId);
  const namePlaceholder = selectedDrive
    ? `${driveLabel(selectedDrive)} Form Link`
    : "e.g. Winter 2025 Form Link";
  const canSave = form.driveId !== "" && !isPending;

  async function handleSave() {
    const fields = {
      name: form.name.trim() || undefined,
      driveId: form.driveId,
      active: form.active,
      showOnStorefront: form.showOnStorefront,
    };
    if (mode === "create") {
      await createLink(fields);
    } else if (initial) {
      await updateLink({ id: initial.id, ...fields });
    }
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm("Delete this form link? This can't be undone.")) return;
    await deleteLink(initial.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New form link" : "Edit form link"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a registration link for a gift drive."
              : `Editing ${initial ? formLinkName(initial, selectedDrive) : "form link"}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="form-link-name">Name</Label>
            <Input
              id="form-link-name"
              placeholder={namePlaceholder}
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Optional. Defaults to the drive name if left blank.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="form-link-drive">Drive</Label>
            <DrivePicker
              id="form-link-drive"
              value={form.driveId}
              onValueChange={(driveId) => setForm((f) => ({ ...f, driveId }))}
              drives={drives}
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="form-link-active"
              checked={form.active}
              onCheckedChange={(checked) =>
                setForm((f) => ({
                  ...f,
                  active: !!checked,
                  // An inactive link can't be shown on the storefront.
                  showOnStorefront: checked ? f.showOnStorefront : false,
                }))
              }
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="form-link-active" className="cursor-pointer">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Families can open the form while it's active.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="form-link-storefront"
              checked={form.showOnStorefront}
              disabled={!form.active}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, showOnStorefront: !!checked }))
              }
              className="mt-0.5"
            />
            <div>
              <Label
                htmlFor="form-link-storefront"
                className="cursor-pointer"
              >
                Show on storefront
              </Label>
              <p className="text-xs text-muted-foreground">
                Makes this the link shown on the storefront. Any other link
                shown there is replaced.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          {mode === "edit" ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={!canSave}>
              {isCreating
                ? "Creating…"
                : isUpdating
                  ? "Saving…"
                  : mode === "create"
                    ? "Create link"
                    : "Save changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
