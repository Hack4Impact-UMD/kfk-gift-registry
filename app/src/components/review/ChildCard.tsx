import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { EditableField } from "./EditableField";
import { ReviewGift } from "./ReviewGift";
import { useEffect, useRef, useState, useTransition } from "react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import ProfileHeader from "@/assets/default-profile-photo.png";
import { PencilIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/solid";
import type { Child, Gift, TimePeriod } from "common";
import { eq, useLiveQuery } from "@tanstack/react-db";
import type { Transaction } from "@tanstack/react-db";
import { useCollections } from "@/collections/context";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import {
  CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE,
  GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE,
  GIFT_TITLE_TOO_LONG_MESSAGE,
  MAX_CHILD_PUBLIC_BLURB_LENGTH,
  isChildPublicBlurbTooLong,
  isGiftFamilyPublicNotesTooLong,
  isGiftTitleTooLong,
  letterToTreatmentLevel,
  treatmentLevelToLetter,
} from "common";

interface ChildCardProps {
  child: Child;
}

const levelOptions: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
const timePeriodOptions: Array<TimePeriod> = [
  "<6m",
  "6m-1y",
  "1-2y",
  "3-4y",
  "5+y",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024;
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

export function ChildCard({ child }: ChildCardProps) {
  const collections = useCollections();
  const [editing, setEditing] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoReadIdRef = useRef(0);
  const photoReaderRef = useRef<FileReader | null>(null);
  const childTxRef = useRef<Transaction<Child> | null>(null);
  const giftsTxRef = useRef<Transaction<Gift> | null>(null);

  const {
    data: gifts = [],
    isLoading: giftsLoading,
    isError: giftsIsError,
  } = useLiveQuery(
    (q) =>
      q
        .from({ g: collections.gifts })
        .where(({ g }) => eq(g.childId, child.id)),
    [child.id],
  );

  useEffect(() => {
    return () => {
      photoReaderRef.current?.abort();
    };
  }, []);

  const editChild = (mutate: (draft: Child) => void) => {
    if (!childTxRef.current) {
      childTxRef.current = collections.createChildTransaction();
    }
    const tx = childTxRef.current;
    tx.mutate(() => {
      collections.children.update(child.id, (draft) => mutate(draft as Child));
    });
  };

  const editGift = (giftId: string, mutate: (draft: Gift) => void) => {
    if (!giftsTxRef.current) {
      giftsTxRef.current = collections.createGiftsTransaction();
    }
    const tx = giftsTxRef.current;
    tx.mutate(() => {
      collections.gifts.update(giftId, (draft) => mutate(draft));
    });
  };

  const saveGiftPrice = async (
    giftId: string,
    listedPrice: number | undefined,
  ) => {
    try {
      const tx = collections.gifts.update(giftId, (draft) => {
        draft.listedPrice = listedPrice;
      });
      await tx.isPersisted.promise;
      toast.success("Gift updated successfully");
    } catch (error) {
      toast.error("Save failed");
      console.error("Gift price save failed", error);
    }
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
    invalidatePhotoRead();
    resetPhotoInput();
    if (childTxRef.current && childTxRef.current.state === "pending") {
      childTxRef.current.rollback();
    }
    if (giftsTxRef.current && giftsTxRef.current.state === "pending") {
      giftsTxRef.current.rollback();
    }
    childTxRef.current = null;
    giftsTxRef.current = null;
    setPhotoError(null);
    setEditing(false);
  };

  const handleEditClick = () => {
    childTxRef.current = null;
    giftsTxRef.current = null;
    setPhotoError(null);
    setEditing(true);
  };

  const openPhotoPicker = () => {
    resetPhotoInput();
    fileInputRef.current?.click();
  };

  const handleDeletePhoto = () => {
    invalidatePhotoRead();
    resetPhotoInput();
    setPhotoError(null);
    editChild((draft) => {
      draft.photoUrl = "";
    });
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
      setPhotoError("File size must be 50MB or less.");
      event.target.value = "";
      return;
    }

    const readId = photoReadIdRef.current;
    const reader = new FileReader();
    photoReaderRef.current = reader;
    reader.onload = (loadEvent) => {
      if (readId !== photoReadIdRef.current) {
        return;
      }

      const result = loadEvent.target?.result;
      if (typeof result !== "string") {
        setPhotoError("Failed to read file.");
        return;
      }

      editChild((draft) => {
        draft.photoUrl = result;
      });
      photoReaderRef.current = null;
    };
    reader.onerror = () => {
      if (readId !== photoReadIdRef.current) {
        return;
      }
      setPhotoError("Failed to read file.");
      photoReaderRef.current = null;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (isChildPublicBlurbTooLong(child.publicBlurb)) {
      toast.error(CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE);
      return;
    }

    if (gifts.some((gift) => isGiftTitleTooLong(gift.title))) {
      toast.error(GIFT_TITLE_TOO_LONG_MESSAGE);
      return;
    }

    if (
      gifts.some((gift) =>
        isGiftFamilyPublicNotesTooLong(gift.familyPublicNotes),
      )
    ) {
      toast.error(GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE);
      return;
    }

    const childTx = childTxRef.current;
    const giftsTx = giftsTxRef.current;
    const hasChildMutations = childTx && childTx.mutations.length > 0;
    const hasGiftsMutations = giftsTx && giftsTx.mutations.length > 0;

    if (!hasChildMutations && !hasGiftsMutations) {
      childTxRef.current = null;
      giftsTxRef.current = null;
      invalidatePhotoRead();
      resetPhotoInput();
      setPhotoError(null);
      setEditing(false);
      return;
    }

    startSaveTransition(async () => {
      try {
        await Promise.all([
          hasChildMutations ? childTx.commit() : undefined,
          hasGiftsMutations ? giftsTx.commit() : undefined,
        ]);
        childTxRef.current = null;
        giftsTxRef.current = null;
        invalidatePhotoRead();
        resetPhotoInput();
        setPhotoError(null);
        toast.success("Saved successfully");
        setEditing(false);
      } catch (error) {
        toast.error("Save failed");
        console.error("Child review save failed", error);
      }
    });
  };

  const renderGift = (gift: Gift) => (
    <ReviewGift
      key={gift.id}
      gift={gift}
      editable={editing}
      onTitleChange={(value) =>
        editGift(gift.id, (draft) => {
          draft.title = value;
        })
      }
      onPriceChange={async (value) => {
        const trimmedValue = value.trim();
        if (trimmedValue === "") {
          if (editing) {
            editGift(gift.id, (draft) => {
              draft.listedPrice = undefined;
            });
          } else {
            await saveGiftPrice(gift.id, undefined);
          }
          return;
        }

        const price = parsePriceInput(value);
        if (hasValidListedPrice(price)) {
          if (editing) {
            editGift(gift.id, (draft) => {
              draft.listedPrice = price;
            });
          } else {
            await saveGiftPrice(gift.id, price);
          }
        } else if (value.trim() !== "") {
          toast.warning("Invalid price!");
        }
      }}
      onNotesChange={(value) =>
        editGift(gift.id, (draft) => {
          draft.familyPublicNotes = value;
        })
      }
      onProductUrlChange={(value) =>
        editGift(gift.id, (draft) => {
          draft.productUrl = value;
        })
      }
    />
  );

  return (
    <Card className="w-full max-w-2xl bg-kfk-blue/5 border border-foreground pb-0">
      <CardContent className="flex flex-col py-0">
        <div className="flex flex-col items-start justify-between gap-2 mb-4">
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
                    src={child.photoUrl || ProfileHeader}
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
              {editing && child.photoUrl && (
                <button
                  type="button"
                  className="absolute bg-kfk-red rounded-full h-fit p-1 -top-1 -right-1"
                  onClick={handleDeletePhoto}
                  aria-label={`Remove photo for ${child.name}`}
                >
                  <TrashIcon className="size-4 text-white" />
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
              asChild
              type="button"
              disabled={editing}
              variant="outline"
              size="xs"
            >
              <Link
                to="/staff/child/$childId"
                params={{ childId: child.id }}
                search={(prev) => prev}
              >
                Open Child Page
              </Link>
            </Button>
            <Button
              type="button"
              size="xs"
              disabled={isSaving}
              onClick={editing ? handleSave : handleEditClick}
              className="rounded-sm px-6"
            >
              {editing ? (isSaving ? "Saving..." : "Save") : "Edit"}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="destructive"
                size="xs"
                disabled={isSaving}
                onClick={handleCancelClick}
                className="rounded-sm px-4"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-card px-4 sm:px-6 py-4 gap-3 -mx-6">
          <div className="flex flex-wrap gap-4 items-center">
            {child.category === "warrior" && (
              <div
                className={cn(
                  "flex items-center gap-2 min-w-0",
                  editing && "min-w-[260px] flex-1",
                )}
              >
                <p className="font-bold whitespace-nowrap">Treatment Length:</p>
                <div className="min-w-0 flex-1">
                  <EditableField
                    value={child.diagnosisLengthYears}
                    editable={editing}
                    fieldType="select"
                    selectOptions={timePeriodOptions}
                    onChange={(value: string) =>
                      editChild((draft) => {
                        draft.diagnosisLengthYears = value as TimePeriod;
                      })
                    }
                  />
                </div>
              </div>
            )}
            {child.category === "warrior" && (
              <div
                className={cn(
                  "flex items-center gap-2 min-w-0",
                  editing && "min-w-[260px] flex-1",
                )}
              >
                <p className="font-bold whitespace-nowrap">Diagnosis:</p>
                <div className="min-w-0 flex-1">
                  <EditableField
                    value={child.diagnosis}
                    editable={editing}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      editChild((draft) => {
                        draft.diagnosis = e.target.value;
                      })
                    }
                  />
                </div>
              </div>
            )}
            <div
              className={cn(
                "flex items-center gap-2 min-w-0",
                editing && "min-w-[180px] flex-1",
              )}
            >
              <p className="font-bold whitespace-nowrap">Age:</p>
              <div className="min-w-0 flex-1">
                <EditableField
                  value={child.age}
                  editable={editing}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    editChild((draft) => {
                      draft.age = Number(e.target.value);
                    })
                  }
                />
              </div>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 min-w-0",
                editing && "min-w-[180px] flex-1",
              )}
            >
              <p className="font-bold whitespace-nowrap">Level:</p>
              <div className="min-w-0 flex-1">
                <EditableField
                  value={
                    child.treatmentLevel !== undefined
                      ? treatmentLevelToLetter(child.treatmentLevel)
                      : "Unknown"
                  }
                  editable={editing}
                  fieldType="select"
                  selectOptions={levelOptions}
                  onChange={(value: string) =>
                    editChild((draft) => {
                      draft.treatmentLevel = letterToTreatmentLevel(value);
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            {child.publicBlurb && (
              <>
                <span className="font-bold">Personal Blurb:</span>
                <EditableField
                  value={child.publicBlurb}
                  editable={editing}
                  fieldType={"textarea"}
                  characterLimit={MAX_CHILD_PUBLIC_BLURB_LENGTH}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    editChild((draft) => {
                      draft.publicBlurb = e.target.value;
                    })
                  }
                ></EditableField>
              </>
            )}
          </div>
        </div>

        {giftsIsError && (
          <div role="alert" className="px-4 py-3 text-sm text-kfk-red">
            Failed to load gifts.
          </div>
        )}
        {!giftsIsError && giftsLoading && (
          <div className="px-4 py-3 text-sm text-muted-foreground">
            Loading gifts...
          </div>
        )}
        {!giftsIsError && !giftsLoading && gifts.length > 0 && (
          <div className="flex w-full flex-col">
            <div className="-mx-6 bg-slate-100 px-4 py-2 text-center font-semibold text-muted-foreground sm:px-6">
              Main Gifts
            </div>
            <div className="-mx-6 bg-card px-4 py-1 sm:px-6">
              {gifts.filter((gift) => gift.active).map(renderGift)}
            </div>
            <div className="-mx-6 bg-slate-100 px-4 py-2 text-center font-semibold text-muted-foreground sm:px-6">
              Backup Gifts
            </div>
            <div className="-mx-6 bg-card px-4 py-1 sm:px-6">
              {gifts.filter((gift) => !gift.active).map(renderGift)}
            </div>
          </div>
        )}

        {child.category == "warrior" && (
          <div className="flex flex-row rounded-b-xl bg-slate-100 px-4 sm:px-6 py-4 gap-3 -mx-6">
            <div className="flex flex-col grow">
              <span className="font-semibold whitespace-nowrap shrink-0">
                Social Worker Name:
              </span>
              <div className="min-w-0 flex-1">
                <EditableField
                  value={child.childSocialWorker}
                  editable={editing}
                  size={15}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    editChild((draft) => {
                      draft.childSocialWorker = e.target.value;
                    })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col grow">
              <span className="font-semibold whitespace-nowrap shrink-0">
                Hospital:
              </span>
              <div className="min-w-0 flex-1">
                <EditableField
                  value={child.hospital}
                  editable={editing}
                  size={20}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    editChild((draft) => {
                      draft.hospital = e.target.value;
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
