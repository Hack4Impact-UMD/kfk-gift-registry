import type { FormLink, GiftDrive } from "common";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CopyButton } from "@/components/ui/copybutton";
import { useUpdateFormLink } from "@/hooks/mutations/useUpdateFormLink";
import { formLinkName, formLinkUrl } from "./formLinkUtils";

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "rounded-full bg-kfk-muted-green/40 px-2.5 py-0.5 text-xs font-semibold text-kfk-green"
          : "rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
      }
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

interface FormLinkRowProps {
  link: FormLink;
  drive?: GiftDrive;
  onEdit: (link: FormLink) => void;
}

export function FormLinkRow({ link, drive, onEdit }: FormLinkRowProps) {
  const { mutate: updateLink, isPending } = useUpdateFormLink();
  const url = formLinkUrl(link.id);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card px-5 py-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">
            {formLinkName(link, drive)}
          </span>
          <StatusBadge active={link.active} />
        </div>
        <p className="mt-1 truncate font-mono text-sm text-muted-foreground">
          {url}
        </p>
      </div>

      {link.active && (
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={link.showOnStorefront}
            disabled={isPending}
            onCheckedChange={(checked) =>
              updateLink({ id: link.id, showOnStorefront: !!checked })
            }
          />
          Show on storefront
        </label>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <CopyButton text={url} />
        <Button size="sm" variant="outline" onClick={() => onEdit(link)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </div>
    </div>
  );
}
