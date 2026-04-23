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
    <div className="mx-auto flex w-full max-w-sm flex-col xl:mx-0 xl:max-w-[230px]">
      <img
        className="mb-3 w-full rounded-xl border-4 border-card shadow-xl"
        src={currentPhotoUrl ?? DefaultPhoto}
        alt="Profile Photo"
      />
      {isEditing && (
        <EditableField
          value={currentPhotoUrl ?? ""}
          editable
          placeholder="Photo URL"
          className="mb-3 text-xs"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEditedChild((prev) => ({ ...prev, photoUrl: e.target.value }))
          }
        />
      )}
      <p className="text-xs text-muted-foreground mb-2">Sibling profiles:</p>
      <div className="flex flex-wrap gap-2">
        {siblings.map((sibling) => (
          <SiblingPopover key={sibling.id} sibling={sibling} />
        ))}
      </div>
      <div className="mt-6 w-full space-y-2 rounded-lg border p-4 shadow-md">
        <p className="font-bold">Personal Blurb:</p>
        <EditableField
          value={currentBlurb}
          editable={isEditing}
          className="min-h-[50px]"
          fieldType="textarea"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setEditedChild((prev) => ({ ...prev, publicBlurb: e.target.value }))
          }
        />
      </div>
    </div>
  );
}
