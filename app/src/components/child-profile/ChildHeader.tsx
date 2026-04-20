import { useState } from "react";
import { Child } from "../../../../common/src/types/child";
import { Button } from "../ui/button";
import { ConfirmUnpublishModal } from "./ConfirmUnpublishModal";
import { EditableField } from "../review/EditableField";

type ChildHeaderProps = {
  child: Child;
  editedChild: Partial<Child>;
  setEditedChild: React.Dispatch<React.SetStateAction<Partial<Child>>>;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ChildHeader({
  child,
  editedChild,
  setEditedChild,
  isEditing,
  setIsEditing,
  onSave,
  onCancel,
}: ChildHeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const currentName = editedChild.name ?? child.name;
  const currentCategory = editedChild.category ?? child.category;

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <h1 className="text-3xl font-medium">
          {currentName}
        </h1>
        <div
          className={
            currentCategory === "warrior"
              ? "text-center text-kfk-brown bg-kfk-yellow/30 rounded-full border border-kfk-brown px-4"
              : "text-center text-kfk-blue bg-kfk-light-blue/30 rounded-full border border-kfk-blue px-4"
          }
        >
          {currentCategory === "warrior" ? "Warrior" : "Super Sib"}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => {
            if (isEditing) {
              onSave();
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? "Save" : "Edit"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            if (isEditing) {
              onCancel();
            } else {
              setConfirmOpen(true);
            }
          }}
        >
          {isEditing ? "Cancel" : "Unpublish"}
        </Button>
      </div>

      <ConfirmUnpublishModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          // Handle unpublish logic here
        }}
      />

    </div>
  );
}