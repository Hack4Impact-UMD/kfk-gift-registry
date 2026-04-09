import { Card, CardContent } from "@/components/ui/card";
import { Button } from "../ui/button";
import { EditableField } from "./EditableField";
import { useState } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import ProfileHeader from "@/assets/default-profile-photo.png";
import { ReviewChild } from "@/mocks/mockFamily";

interface ChildInfoCardProps {
  child: ReviewChild;
}

export function ChildCard({ child }: ChildInfoCardProps) {
  const [editing, setEditing] = useState(true);
  const [formState, setFormState] = useState({
    childName: child.childName,
    treatmentLength: child.treatmentLength,
    diagnosis: child.diagnosis,
    age: child.age,
    level: child.level,
    blurb: child.blurb,
    socialWorkerName: child.socialWorkerName,
    hospital: child.hospitalName,
  });

  const handleCancelClick = () => {
    setFormState({
      childName: child.childName,
      treatmentLength: child.treatmentLength,
      diagnosis: child.diagnosis,
      age: child.age,
      level: child.level,
      blurb: child.blurb,
      socialWorkerName: child.socialWorkerName,
      hospital: child.hospitalName,
    });
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
              {formState.childName}
            </h2>
            <span
              className={`my-auto py-2 px-5 rounded-full font-bold ${child.status == "Warrior" ? "bg-[#FFF8C2] text-[#733C10]" : "bg-[#D4EAFF] text-[#0036CE]"}`}
            >
              {child.status}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="xs"
              // onClick={editing ? handleSave : handleEditClick}
              onClick={() => {setEditing(true)}}
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

        <div className="flex flex-col bg-card px-4 sm:px-6 py-4 gap-4 -mx-6">
          <div className="flex gap-5 items-center">
            {child.status == "Warrior" && (
              <>
                <p className="font-bold">Treatment Length:</p>
                <EditableField
                  value={formState.treatmentLength}
                  editable={editing}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      treatmentLength: e.target.value,
                    }))
                  }
                />
                <p>Diagnosis: {child.diagnosis}</p>
                <EditableField
                  value={formState.diagnosis}
                  editable={editing}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      diagnosis: e.target.value,
                    }))
                  }
                />
              </>
            )}

            <p>Age:</p>
            <EditableField
              value={formState.age}
              editable={editing}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  age: Number(e.target.value),
                }))
              }
            />

            <p>Level:</p>
            <EditableField
              value={formState.level}
              editable={editing}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  level: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center">
            <p>Personal Blurb:</p>
            <EditableField
              value={formState.blurb}
              editable={editing}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  blurb: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
