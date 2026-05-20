import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserRole } from "common";
import type { UserProfile } from "common";
import { MagnifyingGlassIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllUserProfiles } from "@/hooks/queries/useAllUserProfiles";
import { useCurrentUserProfile } from "@/hooks/queries/useCurrentUserProfile";
import { UserTabHeader } from "@/components/user-management/UserTabHeader";
import type { UserTab } from "@/components/user-management/UserTabHeader";
import { UserCard } from "@/components/user-management/UserCard";
import { InviteUserDialog } from "@/components/user-management/InviteUserDialog";
import { queries } from "@/queries";

export const Route = createFileRoute("/_authenticated/staff/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management - Admin" },
      {
        name: "description",
        content: "Manage system users and permissions",
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(queries.users.all);
  },
  component: RouteComponent,
});

type RoleFilter =
  | UserRole.DIRECTOR
  | UserRole.ADMIN
  | UserRole.VOLUNTEER
  | "all";

const STAFF_ROLES = new Set<UserRole>([
  UserRole.DIRECTOR,
  UserRole.ADMIN,
  UserRole.VOLUNTEER,
]);

const STAFF_ROLE_OPTIONS: Array<{ value: RoleFilter; label: string }> = [
  { value: "all", label: "All roles" },
  { value: UserRole.DIRECTOR, label: "Director" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.VOLUNTEER, label: "Volunteer" },
];

function matchesSearch(user: UserProfile, query: string): boolean {
  const q = query.toLowerCase();
  return (
    user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
  );
}

function RouteComponent() {
  const {
    data: allUsers,
    isPending: usersPending,
    error: usersError,
  } = useAllUserProfiles();
  const {
    data: currentUser,
    isPending: currentUserPending,
    error: currentUserError,
  } = useCurrentUserProfile();

  const [activeTab, setActiveTab] = useState<UserTab>("staff");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [inviteOpen, setInviteOpen] = useState(false);

  const staffUsers = useMemo(
    () => allUsers?.filter((u) => STAFF_ROLES.has(u.role)) ?? [],
    [allUsers],
  );
  const donorUsers = useMemo(
    () => allUsers?.filter((u) => u.role === UserRole.DONOR) ?? [],
    [allUsers],
  );

  const filteredUsers = useMemo(() => {
    let users = activeTab === "staff" ? staffUsers : donorUsers;
    if (search) users = users.filter((u) => matchesSearch(u, search));
    if (activeTab === "staff" && roleFilter !== "all")
      users = users.filter((u) => u.role === roleFilter);
    return users;
  }, [activeTab, staffUsers, donorUsers, search, roleFilter]);

  const canInvite =
    currentUser?.role === UserRole.DIRECTOR ||
    currentUser?.role === UserRole.ADMIN;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            + Invite staff member
          </Button>
        )}
      </div>

      <UserTabHeader
        activeTab={activeTab}
        staffCount={staffUsers.length}
        donorCount={donorUsers.length}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearch("");
          setRoleFilter("all");
        }}
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {activeTab === "staff" && (
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as RoleFilter)}
          >
            <SelectTrigger className="w-40 border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAFF_ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {currentUserPending || usersPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No users found.
        </p>
      ) : usersError ? (
        <p className="py-12 text-center text-sm text-red-500">
          Failed to fetch users: {usersError.message}
        </p>
      ) : currentUserError ? (
        <p className="py-12 text-center text-sm text-red-500">
          Failed to fetch current user: {currentUserError.message}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} currentUser={currentUser} />
          ))}
        </div>
      )}

      {canInvite && currentUser && (
        <InviteUserDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          currentUserRole={currentUser.role}
        />
      )}
    </div>
  );
}
