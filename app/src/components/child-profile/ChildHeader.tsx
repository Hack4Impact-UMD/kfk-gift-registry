import { useState } from "react";
import type { Child } from "../../../../common/src/types/child";
import { Button } from "../ui/button";
import { ConfirmUnpublishModal } from "./ConfirmUnpublishModal";
import { useUpdateChild } from "@/hooks/mutations/useUpdateChild";

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
  const updateChildMutation = useUpdateChild();
  const currentName = editedChild.name ?? child.name;
  const currentCategory = editedChild.category ?? child.category;
  const isPublished = child.published;

  const handleConfirmOpenChange = (open: boolean) => {
    if (!open) {
      updateChildMutation.reset();
    }
    setConfirmOpen(open);
  };

  const handlePublishedChange = async (published: boolean) => {
    updateChildMutation.reset();
    await updateChildMutation.mutateAsync({
      childId: child.id,
      updates: { published },
    });
  };

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
          disabled={updateChildMutation.isPending}
          variant={
            isEditing ? "destructive" : isPublished ? "destructive" : "default"
          }
          onClick={() => {
            if (isEditing) {
              onCancel();
            } else {
              if (isPublished) {
                updateChildMutation.reset();
                setConfirmOpen(true);
              } else {
                void handlePublishedChange(true).catch(() => {
                  // Errors are handled by the mutation's error state and toast.
                });
              }
            }
          }}
        >
          {isEditing
            ? "Cancel"
            : updateChildMutation.isPending
              ? isPublished
                ? "Unpublishing..."
                : "Publishing..."
              : isPublished
                ? "Unpublish"
                : "Publish"}
        </Button>
      </div>

      <ConfirmUnpublishModal
        open={confirmOpen}
        onOpenChange={handleConfirmOpenChange}
        onConfirm={() => handlePublishedChange(false)}
        isPending={updateChildMutation.isPending}
        errorMessage={updateChildMutation.error?.message}
      />
    </div>
  );
}
