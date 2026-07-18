import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gift, Plus } from "lucide-react";
import type { FormLink, GiftDrive } from "common";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copybutton";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllFormLinks } from "@/hooks/queries/useAllFormLinks";
import { useStorefrontFormLink } from "@/hooks/queries/useStorefrontFormLink";
import { useAllGiftDrives } from "@/hooks/queries/useAllGiftDrives";
import { FormLinkDialog } from "@/components/form-links/FormLinkDialog";
import { FormLinkRow } from "@/components/form-links/FormLinkRow";
import {
  driveLabel,
  formLinkName,
  formLinkUrl,
} from "@/components/form-links/formLinkUtils";
import { queries } from "@/queries";

export const Route = createFileRoute("/_authenticated/staff/admin/forms")({
  head: () => ({
    meta: [
      { title: "Form Links - Admin" },
      {
        name: "description",
        content: "Manage family registration form links",
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(queries.formLinks.all),
      context.queryClient.ensureQueryData(queries.formLinks.storefront),
      context.queryClient.ensureQueryData(queries.drives.all),
    ]);
  },
  component: RouteComponent,
});

type DialogState =
  | { mode: "create"; defaultDriveId: string }
  | { mode: "edit"; initial: FormLink }
  | null;

function StorefrontCard({
  link,
  drive,
}: {
  link: FormLink | null | undefined;
  drive?: GiftDrive;
}) {
  if (!link) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storefront link</CardTitle>
          <CardDescription>
            No form link is shown on the storefront yet. Check “Show on
            storefront” on an active link below to make one live.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const url = formLinkUrl(link.id);
  return (
    <Card className="border-kfk-green bg-kfk-muted-green/15">
      <CardHeader>
        <CardDescription className="font-bold text-kfk-green">
          Live on the storefront
        </CardDescription>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Gift className="size-6 shrink-0 text-kfk-green" />
          {drive ? driveLabel(drive) : "Unknown drive"}
        </CardTitle>
        {link.name?.trim() && (
          <CardDescription>{formLinkName(link, drive)}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-background border px-3 py-2 font-mono text-sm">
            {url}
          </code>
          <CopyButton text={url} />
        </div>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const {
    data: formLinks,
    isPending: linksPending,
    error: linksError,
  } = useAllFormLinks();
  const {
    data: storefrontLink,
    isPending: storefrontPending,
    error: storefrontError,
  } = useStorefrontFormLink();
  const {
    data: drives,
    isPending: drivesPending,
    error: drivesError,
  } = useAllGiftDrives();

  const [dialog, setDialog] = useState<DialogState>(null);

  const drivesById = useMemo(() => {
    const map = new Map<string, GiftDrive>();
    for (const drive of drives ?? []) map.set(drive.id, drive);
    return map;
  }, [drives]);

  // Most recent drive first (by start date).
  const sortedDrives = useMemo(
    () =>
      [...(drives ?? [])].sort((a, b) =>
        b.startDate.localeCompare(a.startDate),
      ),
    [drives],
  );

  // Group links by drive id, keeping a keyed record (not flattened).
  const linksByDrive = useMemo(() => {
    const grouped: Record<string, Array<FormLink>> = {};
    for (const link of formLinks ?? []) {
      (grouped[link.driveId] ??= []).push(link);
    }
    return grouped;
  }, [formLinks]);

  // Links whose drive no longer exists, so they aren't lost.
  const orphanedLinks = useMemo(
    () => (formLinks ?? []).filter((l) => !drivesById.has(l.driveId)),
    [formLinks, drivesById],
  );

  const isPending = linksPending || storefrontPending || drivesPending;
  const error = linksError ?? storefrontError ?? drivesError;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Form Links</h1>
        <p className="text-sm text-muted-foreground">
          Manage the family registration links for each gift drive.
        </p>
      </div>

      {isPending ? (
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      ) : error ? (
        <p className="py-12 text-center text-sm text-red-500">
          Couldn’t load form links: {error.message}
        </p>
      ) : (
        <>
          <StorefrontCard
            link={storefrontLink}
            drive={
              storefrontLink
                ? drivesById.get(storefrontLink.driveId)
                : undefined
            }
          />

          {sortedDrives.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No gift drives yet. Create a drive to add form links.
            </p>
          ) : (
            sortedDrives.map((drive) => {
              const driveLinks = linksByDrive[drive.id] ?? [];
              return (
                <section key={drive.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {driveLabel(drive)}
                    </h2>
                    <Button
                      size="sm"
                      onClick={() =>
                        setDialog({ mode: "create", defaultDriveId: drive.id })
                      }
                    >
                      <Plus className="size-4" />
                      New form link
                    </Button>
                  </div>

                  {driveLinks.length === 0 ? (
                    <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                      No form links for this drive yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {driveLinks.map((link) => (
                        <FormLinkRow
                          key={link.id}
                          link={link}
                          drive={drive}
                          onEdit={(l) =>
                            setDialog({ mode: "edit", initial: l })
                          }
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          )}

          {orphanedLinks.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Unknown drive
              </h2>
              <div className="flex flex-col gap-3">
                {orphanedLinks.map((link) => (
                  <FormLinkRow
                    key={link.id}
                    link={link}
                    onEdit={(l) => setDialog({ mode: "edit", initial: l })}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {dialog && (
        <FormLinkDialog
          key={
            dialog.mode === "edit"
              ? `edit-${dialog.initial.id}`
              : `create-${dialog.defaultDriveId}`
          }
          open
          onOpenChange={(next) => {
            if (!next) setDialog(null);
          }}
          drives={drives ?? []}
          mode={dialog.mode}
          initial={dialog.mode === "edit" ? dialog.initial : undefined}
          defaultDriveId={
            dialog.mode === "create" ? dialog.defaultDriveId : undefined
          }
        />
      )}
    </div>
  );
}
