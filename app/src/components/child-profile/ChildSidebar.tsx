import { useRef, useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { Child } from "../../../../common/src/types/child";
import type { Family } from "../../../../common/src/types/family";
import { ExternalLink, X } from "lucide-react";
import { SiblingPopover } from "./SiblingPopover";
import { useChildProfilesForFamily } from "@/hooks/queries/useChildProfilesForFamily";
import DefaultPhoto from "@/assets/default-profile-photo.png";
import { EditableField } from "../review/EditableField";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ChildSidebarProps = {
  child: Child;
  family: Family;
  isEditing: boolean;
  editedChild: Partial<Child>;
  setEditedChild: Dispatch<SetStateAction<Partial<Child>>>;
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
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setPhotoError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("Please upload a JPG, PNG, or WebP image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setPhotoError("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") {
        setPhotoError("Failed to read file");
        return;
      }

      setEditedChild((prev) => ({ ...prev, photoUrl: result }));
    };
    reader.onerror = () => {
      setPhotoError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoError(null);
    setEditedChild((prev) => ({ ...prev, photoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label={`Upload photo for ${child.name}`}
          />

          <div
            className={cn(
              "space-y-2 rounded-xl border border-dashed border-border/70 bg-muted/20 p-3 transition-colors",
              isDragging && "border-kfk-blue bg-kfk-light-blue/15",
            )}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) {
                handleFile(file);
              }
            }}
          >
            <Button
              type="button"
              variant="outline"
              className="w-full border-kfk-blue text-kfk-blue hover:bg-kfk-light-blue/10 hover:text-kfk-blue"
              onClick={() => fileInputRef.current?.click()}
            >
              <ExternalLink className="size-4" />
              {currentPhotoUrl ? "Replace Photo" : "Upload Photo"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Drag and drop a JPG, PNG, or WebP up to 5MB
            </p>
          </div>

          {currentPhotoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={handleRemovePhoto}
            >
              <X className="size-4" />
              Remove Photo
            </Button>
          )}

          {photoError && (
            <p className="text-xs text-destructive">{photoError}</p>
          )}
        </div>
      )}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-muted-foreground text pl-1">
          Sibling Profiles:
        </p>
        <div className="flex min-h-12 flex-wrap gap-1.5 rounded-full border border-border/70 bg-card px-2 py-1 shadow-sm">
          {siblings.map((sibling) => (
            <SiblingPopover
              key={sibling.id}
              sibling={sibling}
              disabled={isEditing}
            />
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
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setEditedChild((prev) => ({ ...prev, publicBlurb: e.target.value }))
          }
        />
      </div>
    </div>
  );
}
