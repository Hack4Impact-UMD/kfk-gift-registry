import { useState } from "react";
import { Child } from "../../../../common/src/types/child";
import { Button } from "../ui/button";
import { ConfirmUnpublishModal } from "./ConfirmUnpublishModal";

type ChildHeaderProps = {
  child: Child;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ChildHeader({ child, isEditing, setIsEditing, onSave, onCancel }: ChildHeaderProps) {
const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <h1 className="text-3xl">{child.name}</h1>
        <p 
          className={
            child.category === "warrior"
              ? "text-center text-kfk-brown bg-kfk-yellow/30 rounded-full border border-kfk-brown px-4"
              : "text-center text-kfk-blue bg-kfk-light-blue/30 rounded-full border border-kfk-blue px-4"
          }
        >
          {child.category == "warrior" ? "Warrior" : "Super Sib"}
        </p>
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
          onClick={
            () => {
              if (isEditing) {
                onCancel();
              } else {
                setConfirmOpen(true);
              }
            }
          }
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