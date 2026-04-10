import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { EditableField } from "./EditableField";
import { useState } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import ProfileHeader from "@/assets/default-profile-photo.png";
import { ReviewChild } from "@/routes/_authenticated/staff/review/$familyId";

interface ChildInfoCardProps {
  child: ReviewChild;
  onSave?: (updatedChild: ReviewChild) => void;
}

export function ChildCard({ child, onSave }: ChildInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [formState, setFormState] = useState({
    treatmentLength: child.treatmentLength,
    diagnosis: child.diagnosis,
    age: child.age,
    level: child.level,
    blurb: child.blurb,
    socialWorkerName: child.socialWorkerName,
    hospitalName: child.hospitalName,
  });

  const handleCancelClick = () => {
    setFormState({
      treatmentLength: child.treatmentLength,
      diagnosis: child.diagnosis,
      age: child.age,
      level: child.level,
      blurb: child.blurb,
      socialWorkerName: child.socialWorkerName,
      hospitalName: child.hospitalName,
    });
    setEditing(false);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSave = () => {
    const updatedChild: ReviewChild = {
      ...child,
      treatmentLength: formState.treatmentLength,
      diagnosis: formState.diagnosis,
      age: formState.age,
      level: formState.level,
      blurb: formState.blurb,
      socialWorkerName: formState.socialWorkerName,
      hospitalName: formState.hospitalName,
    };

    if (onSave) onSave(updatedChild);

    setEditing(false);
  };

  return (
    <Card className="w-full max-w-2xl bg-kfk-blue/5 border border-foreground">
      <CardContent className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-5">
            <Avatar className="size-15">
              <AvatarImage src={ProfileHeader}></AvatarImage>
            </Avatar>
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
                fieldSize={10}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    level: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex">
            <EditableField
              value={formState.blurb}
              editable={editing}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  blurb: e.target.value,
                }))
              }
            >
              Personal Blurb:
            </EditableField>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
