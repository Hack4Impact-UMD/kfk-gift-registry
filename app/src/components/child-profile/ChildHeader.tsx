import { useState } from "react";
import type { Child } from "../../../../common/src/types/child";
import { Button } from "../ui/button";
import { ConfirmUnpublishModal } from "./ConfirmUnpublishModal";

type ChildHeaderProps = {
  child: Child;
  editedChild: Partial<Child>;
  isEditing: boolean;
  onStartEditing: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ChildHeader({
  child,
  editedChild,
  isEditing,
  onStartEditing,
  onSave,
  onCancel,
}: ChildHeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const currentName = editedChild.name ?? child.name;
  const currentCategory = editedChild.category ?? child.category;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="break-words text-2xl font-medium sm:text-3xl">
          {currentName}
        </h1>
        <div
          className={
            currentCategory === "warrior"
              ? "self-start rounded-full border border-kfk-brown bg-kfk-yellow/30 px-4 py-1 text-center text-kfk-brown"
              : "self-start rounded-full border border-kfk-blue bg-kfk-light-blue/30 px-4 py-1 text-center text-kfk-blue"
          }
        >
          {currentCategory === "warrior" ? "Warrior" : "Super Sib"}
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            if (isEditing) {
              onSave();
            } else {
              onStartEditing();
            }
          }}
        >
          {isEditing ? "Save" : "Edit"}
        </Button>
        <Button
          className="w-full sm:w-auto"
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
