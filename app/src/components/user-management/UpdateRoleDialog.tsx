import { useState } from "react";
import { UserRole, type UserProfile } from "common";
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
import { Label } from "@/components/ui/label";
import { useUpdateUserRole } from "@/hooks/mutations/useUpdateUserRole";

interface UpdateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
}

const ROLE_OPTIONS = [
  { value: UserRole.DIRECTOR, label: "Director" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.VOLUNTEER, label: "Volunteer" },
] as const;

export function UpdateRoleDialog({
  open,
  onOpenChange,
  user,
}: UpdateRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<
    UserRole.DIRECTOR | UserRole.ADMIN | UserRole.VOLUNTEER
  >(
    user.role === UserRole.DIRECTOR ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.VOLUNTEER
      ? user.role
      : UserRole.VOLUNTEER,
  );

  const { mutate: updateRole, isPending } = useUpdateUserRole();

  function handleSubmit() {
    updateRole(
      { userId: user.id, role: selectedRole },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update role</DialogTitle>
          <DialogDescription>
            Change the role for{" "}
            <span className="font-semibold text-foreground">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="role-select">New role</Label>
          <Select
            value={selectedRole}
            onValueChange={(v) =>
              setSelectedRole(v as UserRole.DIRECTOR | UserRole.ADMIN | UserRole.VOLUNTEER)
            }
          >
            <SelectTrigger id="role-select" className="w-full border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
