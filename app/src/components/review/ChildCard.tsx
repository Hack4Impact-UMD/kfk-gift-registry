import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { EditableField } from "./EditableField";
import { ReviewGift } from "./ReviewGift";
import { useRef, useState } from "react";
import type { ChangeEventHandler } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import ProfileHeader from "@/assets/default-profile-photo.png";
import type { ReviewChild } from "@/routes/_authenticated/staff/review/$familyId";
import { PencilIcon, PhotoIcon } from "@heroicons/react/24/solid";
import type { Gift } from "common";

interface ChildInfoCardProps {
  child: ReviewChild;
  onSave?: (updatedChild: ReviewChild) => void;
}

const levelOptions: Array<string> = ["A", "B", "C", "D"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function parsePriceInput(raw: string): number | undefined {
  const t = raw.trim();
  if (t === "") return undefined;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : undefined;
}

function computeWordCount(text: string | undefined): number {
  const trimmed = text?.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function ChildCard({ child, onSave }: ChildInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoReadIdRef = useRef(0);
  const photoReaderRef = useRef<FileReader | null>(null);
  const isEditingRef = useRef(false);
  const [formState, setFormState] = useState({
    treatmentLength: child.treatmentLength,
    diagnosis: child.diagnosis,
    age: child.age,
    level: child.level,
    blurb: child.blurb,
    socialWorkerName: child.socialWorkerName,
    hospitalName: child.hospitalName,
    photoUrl: child.photoUrl,
    gifts: child.gifts,
  });

  const updateGift = (giftId: string, patch: Partial<Gift>) => {
    setFormState((prev) => ({
      ...prev,
      gifts: prev.gifts.map((g) => (g.id === giftId ? { ...g, ...patch } : g)),
    }));
  };

  const invalidatePhotoRead = () => {
    photoReadIdRef.current += 1;
    photoReaderRef.current?.abort();
    photoReaderRef.current = null;
  };

  const handleCancelClick = () => {
    invalidatePhotoRead();
    isEditingRef.current = false;
    setFormState({
      treatmentLength: child.treatmentLength,
      diagnosis: child.diagnosis,
      age: child.age,
      level: child.level,
      blurb: child.blurb,
      socialWorkerName: child.socialWorkerName,
      hospitalName: child.hospitalName,
      photoUrl: child.photoUrl,
      gifts: child.gifts,
    });
    setPhotoError(null);
    setEditing(false);
  };

  const handleEditClick = () => {
    isEditingRef.current = true;
    setPhotoError(null);
    setEditing(true);
  };

  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    invalidatePhotoRead();
    setPhotoError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("Please upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setPhotoError("File size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    const readId = photoReadIdRef.current;
    const reader = new FileReader();
    photoReaderRef.current = reader;
    reader.onload = (loadEvent) => {
      if (readId !== photoReadIdRef.current || !isEditingRef.current) {
        return;
      }

      const result = loadEvent.target?.result;
      if (typeof result !== "string") {
        setPhotoError("Failed to read file.");
        return;
      }

      setFormState((prev) => ({
        ...prev,
        photoUrl: result,
      }));
      photoReaderRef.current = null;
    };
    reader.onerror = () => {
      if (readId !== photoReadIdRef.current || !isEditingRef.current) {
        return;
      }

      setPhotoError("Failed to read file.");
      photoReaderRef.current = null;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const currentWordCount = computeWordCount(formState.blurb);

    if (currentWordCount > 25) {
      alert("Maximum words exceeded");
      return;
    }
    const updatedChild: ReviewChild = {
      ...child,
      treatmentLength: formState.treatmentLength,
      diagnosis: formState.diagnosis,
      age: formState.age,
      level: formState.level,
      blurb: formState.blurb,
      socialWorkerName: formState.socialWorkerName,
      hospitalName: formState.hospitalName,
      photoUrl: formState.photoUrl,
      gifts: formState.gifts,
    };

    if (onSave) {
      onSave(updatedChild);
    }

    invalidatePhotoRead();
    isEditingRef.current = false;
    setPhotoError(null);
    setEditing(false);
  };

  return (
    <Card className="w-full max-w-2xl bg-kfk-blue/5 border border-foreground pb-0">
      <CardContent className="flex flex-col py-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-5">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-auto rounded-full p-0 transition-all hover:bg-transparent focus-visible:ring-kfk-blue/50 focus-visible:ring-offset-2 enabled:hover:scale-105 disabled:opacity-100"
                onClick={editing ? openPhotoPicker : undefined}
                aria-label={`Upload photo for ${child.childName}`}
                disabled={!editing}
              >
                <Avatar
                  className={`size-15 ${
                    editing
                      ? "ring-2 ring-kfk-blue/30 shadow-md hover:ring-kfk-blue"
                      : ""
                  }`}
                >
                  <AvatarImage
                    src={formState.photoUrl ?? ProfileHeader}
                  ></AvatarImage>
                  <AvatarFallback className="bg-kfk-light-blue text-kfk-blue">
                    <PhotoIcon className="size-6" />
                  </AvatarFallback>
                </Avatar>
              </Button>
              {editing && (
                <button
                  type="button"
                  className="absolute bg-kfk-blue rounded-full h-fit p-1 top-10 left-10"
                  onClick={openPhotoPicker}
                  aria-label={`Upload photo for ${child.childName}`}
                >
                  <PencilIcon className="size-4 text-white" />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-5">
                <h2 className="text-xl sm:text-3xl font-bold my-auto">
                  {child.childName}
                </h2>
                <span
                  className={`my-auto rounded-full border px-5 py-1 ${
                    child.status == "Warrior"
                      ? "border-kfk-brown bg-kfk-muted-yellow text-kfk-brown"
                      : "border-kfk-blue/20 bg-kfk-light-blue text-kfk-blue"
                  }`}
                >
                  {child.status}
                </span>
              </div>
              {editing && photoError && (
                <p className="w-fit rounded-md border border-kfk-red/20 bg-kfk-muted-red/30 px-2 py-1 text-sm text-kfk-red">
                  {photoError}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="xs"
              onClick={editing ? handleSave : handleEditClick}
              className="rounded-sm px-6"
            >
              {editing ? "Save" : "Edit"}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="destructive"
                size="xs"
                onClick={handleCancelClick}
                className="rounded-sm px-4"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-card px-4 sm:px-6 py-4 gap-3 -mx-6">
          <div className="flex gap-2">
            {child.status === "Warrior" && (
              <>
                <div className="flex items-center gap-2">
                  <p className="font-bold whitespace-nowrap">
                    Treatment Length:
                  </p>
                  <EditableField
                    value={formState.treatmentLength}
                    editable={editing}
                    size={20}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormState((prev) => ({
                        ...prev,
                        treatmentLength: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold whitespace-nowrap">Diagnosis:</p>
                  <EditableField
                    value={formState.diagnosis}
                    editable={editing}
                    size={20}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormState((prev) => ({
                        ...prev,
                        diagnosis: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <p className="font-bold whitespace-nowrap">Age:</p>
              <EditableField
                value={formState.age}
                editable={editing}
                size={5}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormState((prev) => ({
                    ...prev,
                    age: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="font-bold whitespace-nowrap">Level:</p>
              <EditableField
                value={formState.level}
                editable={editing}
                size={10}
                fieldType="select"
                selectOptions={levelOptions}
                onChange={
                  ((value: string) =>
                    setFormState((prev) => ({
                      ...prev,
                      level: value,
                    }))) as unknown as ChangeEventHandler<HTMLInputElement>
                }
              />
            </div>
          </div>
          <div className="flex flex-col">
            <EditableField
              value={formState.blurb}
              editable={editing}
              fieldType={"textarea"}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const nextBlurb = e.target.value;
                setFormState((prev) => ({
                  ...prev,
                  blurb: nextBlurb,
                }));
              }}
            >
              Personal Blurb:
            </EditableField>
          </div>
        </div>

        {formState.gifts.length > 0 && (
          <div className="w-full py-4">
            <div className="rounded-md bg-slate-100 px-3 py-1 sm:px-4">
              {formState.gifts.map((gift) => (
                <ReviewGift
                  key={gift.id}
                  gift={gift}
                  editable={editing}
                  onTitleChange={(value) =>
                    updateGift(gift.id, { title: value })
                  }
                  onPriceChange={(value) =>
                    updateGift(gift.id, {
                      listedPrice: parsePriceInput(value),
                    })
                  }
                  onNotesChange={(value) =>
                    updateGift(gift.id, { privateNotes: value || undefined })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {child.status == "Warrior" && (
          <div className="flex flex-row rounded-b-xl bg-card px-4 sm:px-6 py-4 gap-3 -mx-6">
            <div className="flex items-center gap-2">
              <p className="font-bold whitespace-nowrap">Social Worker Name:</p>
              <EditableField
                value={formState.socialWorkerName}
                editable={editing}
                size={15}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormState((prev) => ({
                    ...prev,
                    socialWorkerName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="font-bold whitespace-nowrap">Hospital:</p>
              <EditableField
                value={formState.hospitalName}
                editable={editing}
                size={20}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormState((prev) => ({
                    ...prev,
                    hospitalName: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
