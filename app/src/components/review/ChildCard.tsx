import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { EditableField } from "./EditableField";
import { ReviewGift } from "./ReviewGift";
import { useState } from "react";
import type { ChangeEventHandler } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import ProfileHeader from "@/assets/default-profile-photo.png";
import type { ReviewChild } from "@/routes/_authenticated/staff/review/$familyId";
import { PencilIcon } from "@heroicons/react/24/solid";
import type { Gift } from "common";

interface ChildInfoCardProps {
  child: ReviewChild;
  onSave?: (updatedChild: ReviewChild) => void;
}

const levelOptions: Array<string> = ["A", "B", "C", "D"];

function parsePriceInput(raw: string): number | undefined {
  const t = raw.trim();
  if (t === "") return undefined;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : undefined;
}

export function ChildCard({ child, onSave }: ChildInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [formState, setFormState] = useState({
    treatmentLength: child.treatmentLength,
    diagnosis: child.diagnosis,
    age: child.age,
    level: child.level,
    blurb: child.blurb,
    socialWorkerName: child.socialWorkerName,
    hospitalName: child.hospitalName,
    gifts: child.gifts,
  });

  const updateGift = (giftId: string, patch: Partial<Gift>) => {
    setFormState((prev) => ({
      ...prev,
      gifts: prev.gifts.map((g) =>
        g.id === giftId ? { ...g, ...patch } : g,
      ),
    }));
  };

  const handleCancelClick = () => {
    setFormState({
      treatmentLength: child.treatmentLength,
      diagnosis: child.diagnosis,
      age: child.age,
      level: child.level,
      blurb: child.blurb,
      socialWorkerName: child.socialWorkerName,
      hospitalName: child.hospitalName,
      gifts: child.gifts,
    });
    setEditing(false);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSave = () => {
    if (wordCount > 25) {
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
      gifts: formState.gifts,
    };

    if (onSave) {
      onSave(updatedChild);
    }

    setEditing(false);
  };

  return (
    <Card className="w-full max-w-2xl bg-kfk-blue/5 border border-foreground pb-0">
      <CardContent className="flex flex-col py-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-5">
            <div className="relative">
              <Avatar className="size-15">
                <AvatarImage src={ProfileHeader}></AvatarImage>
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
              {editing && (
                <div className="absolute bg-kfk-blue rounded-full h-fit p-1 top-10 left-10">
                  <PencilIcon className="size-4 text-white" />
                </div>
              )}
            </div>
            <h2 className="text-xl sm:text-3xl font-bold my-auto">
              {child.childName}
            </h2>
            <span
              className={`my-auto py-1 px-5 rounded-full border-1 border-gray-200 ${child.status == "Warrior" ? "bg-[#FFF8C2] text-[#733C10]" : "bg-[#D4EAFF] text-[#0036CE]"}`}
            >
              {child.status}
            </span>
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
                    onChange={(e) =>
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
                    onChange={(e) =>
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
                onChange={(e) =>
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
              onChange={(e) => {
                setFormState((prev) => ({
                  ...prev,
                  blurb: e.target.value,
                }));

                const formWordCount = formState.blurb.trim()
                  ? formState.blurb.trim().split(/\s+/).length
                  : 0;
                setWordCount(formWordCount);
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
                onChange={(e) =>
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
                onChange={(e) =>
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
