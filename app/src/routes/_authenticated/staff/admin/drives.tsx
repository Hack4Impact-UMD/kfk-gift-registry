import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { Plus, SquarePen } from "lucide-react";
import type { GiftDrive } from "common";
import { CalendarIcon } from "@/components/icons";
import { GiftDriveDialog } from "@/components/gift-drives/GiftDriveDialog";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeactivateGiftDrive } from "@/hooks/mutations/useDeactivateGiftDrive";
import { useAllGiftDrives } from "@/hooks/queries/useAllGiftDrives";
import { formatISODate } from "@/lib/utils";
import { queries } from "@/queries";

export const Route = createFileRoute("/_authenticated/staff/admin/drives")({
  head: () => ({
    meta: [
      { title: "Gift Drives - Admin" },
      {
        name: "description",
        content: "Create and manage gift drives",
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(queries.drives.all);
  },
  component: RouteComponent,
});

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; initial: GiftDrive }
  | null;

function getDriveStatus(drive: GiftDrive) {
  const now = DateTime.utc();
  const start = DateTime.fromISO(drive.startDate, { zone: "utc" });
  const end = DateTime.fromISO(drive.endDate, { zone: "utc" });

  if (start > now) {
    return {
      label: "Upcoming",
      className: "bg-kfk-light-blue text-kfk-blue",
    };
  }

  if (end < now) {
    return {
      label: "Completed",
      className: "bg-muted text-muted-foreground",
    };
  }

  return {
    label: "Active",
    className: "bg-kfk-muted-green/30 text-kfk-green",
  };
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const { data: drives, isPending, error } = useAllGiftDrives();
  const { mutateAsync: deactivateDrive, isPending: isDeactivating } =
    useDeactivateGiftDrive();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [drivePendingDeactivation, setDrivePendingDeactivation] =
    useState<GiftDrive | null>(null);

  const sortedDrives = useMemo(
    () =>
      [...(drives ?? [])].sort((a, b) =>
        b.startDate.localeCompare(a.startDate),
      ),
    [drives],
  );

  const counts = useMemo(() => {
    return sortedDrives.reduce(
      (totals, drive) => {
        const status = getDriveStatus(drive).label;
        if (status === "Active") totals.active += 1;
        if (status === "Upcoming") totals.upcoming += 1;
        if (status === "Completed") totals.completed += 1;
        return totals;
      },
      { active: 0, upcoming: 0, completed: 0 },
    );
  }, [sortedDrives]);

  async function handleDeactivateDrive() {
    if (!drivePendingDeactivation) return;
    await deactivateDrive(drivePendingDeactivation.id);
    setDrivePendingDeactivation(null);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gift Drives</h1>
          <p className="text-sm text-muted-foreground">
            View drive windows and add new cycles when staff needs a new season.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <Plus className="size-4" />
          New gift drive
        </Button>
      </div>

      {isPending ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : error ? (
        <p className="py-12 text-center text-sm text-red-500">
          Failed to load gift drives: {error.message}
        </p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              title="Active drives"
              value={counts.active}
              description="Drives currently visible in the live program window."
            />
            <SummaryCard
              title="Upcoming drives"
              value={counts.upcoming}
              description="Drives scheduled to start later."
            />
            <SummaryCard
              title="Completed drives"
              value={counts.completed}
              description="Past drives kept for reference and linked records."
            />
          </div>

          {sortedDrives.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No gift drives yet. Create your first drive to start linking
                forms and staff workflows.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedDrives.map((drive) => {
                const status = getDriveStatus(drive);
                return (
                  <Card key={drive.id}>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <CardTitle className="text-xl">
                            {drive.cycle}
                          </CardTitle>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <CalendarIcon className="size-4 shrink-0" />
                          {formatISODate(drive.startDate)} to{" "}
                          {formatISODate(drive.endDate)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {status.label === "Active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDrivePendingDeactivation(drive)}
                            disabled={isDeactivating}
                          >
                            Deactivate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDialog({ mode: "edit", initial: drive })
                          }
                          disabled={isDeactivating}
                        >
                          <SquarePen className="size-4" />
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                      <div>
                        <p className="font-medium text-foreground">Start</p>
                        <p>{formatISODate(drive.startDate)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">End</p>
                        <p>{formatISODate(drive.endDate)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Created</p>
                        <p>{formatISODate(drive.createdAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {dialog && (
        <GiftDriveDialog
          key={dialog.mode === "edit" ? dialog.initial.id : "create"}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={dialog.mode}
          initial={dialog.mode === "edit" ? dialog.initial : undefined}
        />
      )}

      <AlertDialog
        open={drivePendingDeactivation !== null}
        onOpenChange={(open) => {
          if (!open) setDrivePendingDeactivation(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate gift drive</AlertDialogTitle>
            <AlertDialogDescription>
              {drivePendingDeactivation
                ? `End ${drivePendingDeactivation.cycle} today? This updates the drive end date to now.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateDrive}
              disabled={isDeactivating}
            >
              {isDeactivating ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
