import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { EditableField } from "./EditableField";
import { ReviewGift } from "./ReviewGift";
import { useRef, useState } from "react";
import type { ChangeEventHandler } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import ProfileHeader from "@/assets/default-profile-photo.png";
import { PencilIcon, PhotoIcon } from "@heroicons/react/24/solid";
import type { Child, Gift, TimePeriod } from "common";
import { useUpdateGift } from "@/hooks/mutations/useUpdateGift";
import { useDebouncer } from "@tanstack/react-pacer";
import { toast } from "sonner";

interface ChildInfoCardProps {
  child: Child;
  fetchedGifts: Array<Gift> | undefined;
  onSave?: (updatedChild: Child) => void;
}

export interface ChildFormState {
  treatmentLength: TimePeriod | undefined;
  diagnosis: string;
  age: number;
  level: number | undefined;
  blurb: string | undefined;
  socialWorkerName: string;
  hospitalName: string;
  photoUrl: string | undefined;
  gifts: Array<Gift>; // This is the crucial part
}

const levelOptions: Array<"1" | "2" | "3"> = ["1", "2", "3"];
const timePeriodOptions: Array<TimePeriod> = [
  "<6m",
  "6m-1y",
  "1-2y",
  "3-4y",
  "5+y",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function parsePriceInput(raw: string): number | undefined {
  const t = raw.trim();
  if (t === "") return undefined;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : undefined;
}

function hasValidListedPrice(
  listedPrice: number | undefined,
): listedPrice is number {
  return listedPrice !== undefined && Number.isFinite(listedPrice);
}

function computeWordCount(text: string | undefined): number {
  const trimmed = text?.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function ChildCard({ child, fetchedGifts, onSave }: ChildInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoReadIdRef = useRef(0);
  const photoReaderRef = useRef<FileReader | null>(null);
  const isEditingRef = useRef(false);
  const [formState, setFormState] = useState<ChildFormState>({
    treatmentLength: child.diagnosisLengthYears,
    diagnosis: child.diagnosis,
    age: child.age,
    level: child.treatmentLevel,
    blurb: child.publicBlurb,
    socialWorkerName: child.childSocialWorker,
    hospitalName: child.hospital,
    photoUrl: child.photoUrl,
    gifts: fetchedGifts || [],
  });
  const { mutate: updateGift } = useUpdateGift();

  const debouncedUpdateGift = useDebouncer(updateGift, {
    wait: 500,
  });

  const updatePrice = (giftId: string, price: number | undefined) => {
    setFormState((prev) => ({
      ...prev,
      gifts: prev.gifts.map((g) =>
        g.id === giftId ? { ...g, listedPrice: price } : g,
      ),
    }));

    if (hasValidListedPrice(price)) {
      debouncedUpdateGift.maybeExecute({
        giftId: giftId,
        updates: {
          listedPrice: price,
        },
      });
    } else {
      toast.warning("Invalid price!");
    }
  };

  const updateLocalGift = (giftId: string, patch: Partial<Gift>) => {
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

  const resetPhotoInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelClick = () => {
    debouncedUpdateGift.cancel();
    invalidatePhotoRead();
    resetPhotoInput();
    isEditingRef.current = false;
    setFormState({
      treatmentLength: child.diagnosisLengthYears,
      diagnosis: child.diagnosis,
      age: child.age,
      level: child.treatmentLevel,
      blurb: child.publicBlurb,
      socialWorkerName: child.childSocialWorker,
      hospitalName: child.hospital,
      photoUrl: child.photoUrl,
      gifts: fetchedGifts ?? [],
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
    resetPhotoInput();
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
    debouncedUpdateGift.cancel();
    const currentWordCount = computeWordCount(formState.blurb);

    if (currentWordCount > 25) {
      alert("Maximum words exceeded");
      return;
    }
    const updatedChild: Child = {
      ...child,
      diagnosisLengthYears: formState.treatmentLength,
      diagnosis: formState.diagnosis,
      age: formState.age,
      treatmentLevel: formState.level,
      publicBlurb: formState.blurb,
      childSocialWorker: formState.socialWorkerName,
      hospital: formState.hospitalName,
      photoUrl: formState.photoUrl,
    };

    if (onSave) {
      onSave(updatedChild);
      formState.gifts.map((gift) => {
        const updates = {
          title: gift.title,
          status: gift.status,
          familyPublicNotes: gift.familyPublicNotes,
          ...(hasValidListedPrice(gift.listedPrice)
            ? { listedPrice: gift.listedPrice }
            : {}),
        };

        updateGift({
          giftId: gift.id,
          updates,
        });
      });
    }

    invalidatePhotoRead();
    resetPhotoInput();
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
                aria-label={`Upload photo for ${child.name}`}
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
                  aria-label={`Upload photo for ${child.name}`}
                >
                  <PencilIcon className="size-4 text-white" />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1 my-auto">
              <div className="flex gap-5">
                <h2 className="text-xl sm:text-3xl font-bold my-auto">
                  {child.name}
                </h2>
                <span
                  className={`my-auto rounded-full border border-gray-200 px-5 py-1 ${
                    child.category == "warrior"
                      ? "bg-[#FFF8C2] text-kfk-brown"
                      : "bg-kfk-light-blue text-kfk-blue"
                  }`}
                >
                  {child.category == "warrior" ? "Warrior" : "SuperSib"}
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
          <div className={`flex gap-2 ${editing && "flex-col"}`}>
            {child.category === "warrior" && (
              <>
                <div className="flex items-center gap-2">
                  <p className="font-bold whitespace-nowrap">
                    Treatment Length:
                  </p>
                  <EditableField
                    value={formState.treatmentLength}
                    editable={editing}
                    size={20}
                    fieldType="select"
                    selectOptions={timePeriodOptions}
                    onChange={
                      ((value: string) =>
                        setFormState((prev) => ({
                          ...prev,
                          treatmentLength: value as TimePeriod,
                        }))) as unknown as ChangeEventHandler<HTMLInputElement>
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
                      level: Number(value),
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
            <div className="rounded-md bg-slate-100 py-1">
              {formState.gifts.map((gift) => (
                <ReviewGift
                  key={gift.id}
                  gift={gift}
                  editable={editing}
                  onTitleChange={(value) =>
                    updateLocalGift(gift.id, { title: value })
                  }
                  onPriceChange={(value) =>
                    updatePrice(gift.id, parsePriceInput(value))
                  }
                  onNotesChange={(value) =>
                    updateLocalGift(gift.id, { familyPublicNotes: value })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {child.category == "warrior" && (
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
