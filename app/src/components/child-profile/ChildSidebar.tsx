import type { Child } from "../../../../common/src/types/child";
import type { Family } from "../../../../common/src/types/family";
import { SiblingPopover } from "./SiblingPopover";
import { useChildProfilesForFamily } from "@/hooks/queries/useChildProfilesForFamily";
import DefaultPhoto from "@/assets/default-profile-photo.png";
import { EditableField } from "../review/EditableField";

type ChildSidebarProps = {
  child: Child;
  family: Family;
  isEditing: boolean;
  editedChild: Partial<Child>;
  setEditedChild: React.Dispatch<React.SetStateAction<Partial<Child>>>;
};

export function ChildSidebar({
  child,
  family,
  isEditing,
  editedChild,
  setEditedChild,
}: ChildSidebarProps) {
  const { data: children = [] } = useChildProfilesForFamily(family.id);
  const siblings = children.filter((c) => c.id !== child.id);
  const currentPhotoUrl = editedChild.photoUrl ?? child.photoUrl;
  const currentBlurb = editedChild.publicBlurb ?? child.publicBlurb ?? "";

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 xl:mx-0 xl:max-w-[230px]">
      <div className="overflow-hidden rounded-[20px] border border-border/70 bg-muted/40 p-1 shadow-sm">
        <img
          className="aspect-[4/5] w-full rounded-[16px] bg-kfk-light-grey object-cover"
          src={currentPhotoUrl || DefaultPhoto}
          alt={`${child.name} profile photo`}
        />
      </div>
      {isEditing && (
        <EditableField
          value={currentPhotoUrl ?? ""}
          editable
          placeholder="Photo URL"
          className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-2 text-xs"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEditedChild((prev) => ({ ...prev, photoUrl: e.target.value }))
          }
        />
      )}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-muted-foreground text pl-1">
          Sibling Profiles:
        </p>
        <div className="flex min-h-12 flex-wrap gap-1.5 rounded-full border border-border/70 bg-card px-2 py-1 shadow-sm">
          {siblings.map((sibling) => (
            <SiblingPopover key={sibling.id} sibling={sibling} />
          ))}
        </div>
      </div>
      <div className="w-full space-y-2 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Personal Blurb:</p>
        <EditableField
          value={currentBlurb}
          editable={isEditing}
          className="min-h-[112px] border-border/70 bg-background/80 text-sm leading-6"
          fieldType="textarea"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setEditedChild((prev) => ({ ...prev, publicBlurb: e.target.value }))
          }
        />
      </div>
    </div>
  );
}
