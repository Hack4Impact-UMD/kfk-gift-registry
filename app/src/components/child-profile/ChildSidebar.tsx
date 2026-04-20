import { Child } from "../../../../common/src/types/child";
import { Family } from "../../../../common/src/types/family";
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
    <div className="flex flex-col">
      <img
        className="w-[230px] h-auto border-4 border-card rounded-xl shadow-xl mb-3"
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
      <div className="flex flex-wrap">
        {siblings.map((sibling) => (
          <SiblingPopover key={sibling.id} sibling={sibling} />
        ))}
      </div>
      <div className="shadow-md rounded-lg border p-4 space-y-2 max-w-[230px] mt-6">
        <p className="font-bold">Personal Blurb:</p>
        <EditableField
          value={currentBlurb}
          editable={isEditing}
          fieldType="textarea"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setEditedChild((prev) => ({ ...prev, publicBlurb: e.target.value }))
          }
        />
      </div>
    </div>
  );
}