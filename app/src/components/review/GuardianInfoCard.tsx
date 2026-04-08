import { Card, CardContent } from "@/components/ui/card";
import type { Family } from "../../../../common/src/types/family";
import { Button } from "../ui/button";
import { EditableField } from "./EditableField";
import * as React from "react";

interface ChildInfoCardProps {
  family: Family;
}

export function GuardianInfoCard({ family }: ChildInfoCardProps) {
  const [editing, setEditing] = React.useState(false);
  const [formState, setFormState] = React.useState({
    contactName: family.contactName,
    phone: family.phone,
    email: family.email,
    relationship: "Mother", // hardcoded for now
    privateNotes: family.privateNotes || "",
    });

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSave = () => {
    // Update database

    setEditing(false);
  };

  const handleCancelClick = () => {
    setFormState({
      contactName: family.contactName,
      phone: family.phone,
      email: family.email,
      relationship: "Mother",
      privateNotes: family.privateNotes || "",
    });
    setEditing(false);
  };

  return (
    <Card className="w-full max-w-2xl bg-kfk-blue/5 border border-foreground">
      <CardContent className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-3xl font-bold">
                Guardian Information
            </h2>
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

        <div className="flex bg-card px-4 sm:px-6 py-4 gap-4 -mx-6">
            <div className="flex flex-col gap-1">
                <div className="flex flex-row items-center gap-2">
                    <p className="font-bold">Guardian:</p> 
                    <EditableField
                        value={formState.contactName}
                        editable={editing}
                        onChange={(e) =>
                            setFormState((prev) => ({ ...prev, contactName: e.target.value }))
                        }
                    />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <p className="font-bold">Relationship:</p> 
                    <EditableField 
                        value={formState.relationship}
                        editable={editing}
                        onChange={(e) =>
                            setFormState((prev) => ({ ...prev, relationship: e.target.value }))
                        }
                    /> 
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex flex-row items-center gap-2">
                    <p className="font-bold shrink-0">Phone Number:</p> 
                    <EditableField 
                        value={formState.phone}
                        editable={editing}
                        onChange={(e) =>
                            setFormState((prev) => ({ ...prev, phone: e.target.value }))
                        }
                    />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <p className="font-bold">Email:</p> 
                    <EditableField 
                        value={formState.email} 
                        editable={editing}
                        onChange={(e) =>
                            setFormState((prev) => ({ ...prev, email: e.target.value }))
                        }
                    />
                </div>
            </div>
        </div>

        <div className="w-full text-sm sm:text-base text-muted-foreground mt-2">
            <p className="text-foreground text-wrap"><span className="font-bold">Guardian comments:</span> {family.privateNotes}</p>
        </div>
      </CardContent>
    </Card>
  );
}
