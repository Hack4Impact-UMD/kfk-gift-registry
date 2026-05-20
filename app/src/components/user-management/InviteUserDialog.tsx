import { useForm } from "@tanstack/react-form";
import { UserRole } from "common";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { useCreateInvite } from "@/hooks/mutations/useCreateInvite";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: UserRole;
}

type InvitableRole = UserRole.DIRECTOR | UserRole.ADMIN | UserRole.VOLUNTEER;

const ALL_ROLE_OPTIONS: Array<{ value: InvitableRole; label: string }> = [
  { value: UserRole.DIRECTOR, label: "Director" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.VOLUNTEER, label: "Volunteer" },
];

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function getRoleOptions(currentUserRole: UserRole) {
  if (currentUserRole === UserRole.DIRECTOR) return ALL_ROLE_OPTIONS;
  return ALL_ROLE_OPTIONS.filter((o) => o.value !== UserRole.DIRECTOR);
}

export function InviteUserDialog({
  open,
  onOpenChange,
  currentUserRole,
}: InviteUserDialogProps) {
  const { mutateAsync: sendInvite, isPending } = useCreateInvite();
  const roleOptions = getRoleOptions(currentUserRole);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "" as InvitableRole | "",
    },
    onSubmit: async ({ value }) => {
      await sendInvite({ name: value.name, email: value.email, role: value.role as InvitableRole });
      handleClose();
    },
  });

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); else onOpenChange(true); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite staff member</DialogTitle>
          <DialogDescription>
            Send an email invitation to join the KFK Gift Registry team.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Name */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? "Name is required" : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  placeholder="Full name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors.map((e) => ({ message: String(e) }))} />
              </div>
            )}
          </form.Field>

          {/* Email */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim()) return "Email is required";
                if (!EMAIL_RE.test(value)) return "Enter a valid email address";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="email@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors.map((e) => ({ message: String(e) }))} />
              </div>
            )}
          </form.Field>

          {/* Role */}
          <form.Field
            name="role"
            validators={{
              onChange: ({ value }) =>
                !value ? "Please select a role" : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Role</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as InvitableRole)}
                >
                  <SelectTrigger id={field.name} className="w-full border" onBlur={field.handleBlur}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors.map((e) => ({ message: String(e) }))} />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(s) => s.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isPending}>
                  {isPending ? "Sending…" : "Send invite"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
