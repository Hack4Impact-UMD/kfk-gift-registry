import { useState, useTransition } from "react";
import type { Child } from "../../../../common/src/types/child";
import { Button } from "../ui/button";
import { ConfirmUnpublishModal } from "./ConfirmUnpublishModal";

type ChildHeaderProps = {
  child: Child;
  isEditing: boolean;
  onStartEditing: () => void;
  onSave: () => void;
  saving: boolean;
  onCancel: () => void;
  onPublishedChange: (published: boolean) => Promise<void>;
};

export function ChildHeader({
  child,
  isEditing,
  onStartEditing,
  onSave,
  saving,
  onCancel,
  onPublishedChange,
}: ChildHeaderProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startPublishTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const isPublished = child.published;
  const publishAction = isPublished ? "unpublish" : "publish";

  const handleConfirmOpenChange = (open: boolean) => {
    if (!open) {
      setErrorMessage(undefined);
    }
    setConfirmOpen(open);
  };

  const handlePublishedChange = () => {
    setErrorMessage(undefined);
    startPublishTransition(async () => {
      try {
        await onPublishedChange(!isPublished);
        setConfirmOpen(false);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : String(err));
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <h1 className="break-words text-[2rem] font-medium leading-none tracking-tight">
          {child.name}
        </h1>
        <div
          className={
            child.category === "warrior"
              ? "self-start rounded-full border border-kfk-brown bg-kfk-yellow/25 px-3 py-1 text-center text-xs font-medium text-kfk-brown"
              : "self-start rounded-full border border-kfk-blue bg-kfk-light-blue/25 px-3 py-1 text-center text-xs font-medium text-kfk-blue"
          }
        >
          {child.category === "warrior" ? "Warrior" : "Super Sib"}
        </div>
      </div>

      <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
        <Button
          size="sm"
          className="min-w-20 px-4"
          disabled={saving}
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
          size="sm"
          className="min-w-24 px-4"
          disabled={isPending}
          variant={
            isEditing ? "destructive" : isPublished ? "destructive" : "default"
          }
          onClick={() => {
            if (isEditing) {
              onCancel();
            } else {
              setErrorMessage(undefined);
              setConfirmOpen(true);
            }
          }}
        >
          {isEditing
            ? "Cancel"
            : isPending
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
        onConfirm={handlePublishedChange}
        action={publishAction}
        isPending={isPending}
        errorMessage={errorMessage}
      />
    </div>
  );
}
