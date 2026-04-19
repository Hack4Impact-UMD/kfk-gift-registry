import { Card, CardContent } from "@/components/ui/card";
import type { Family } from "../../../../common/src/types/family";
import { Button } from "../ui/button";
import { EditableField } from "./EditableField";
import * as React from "react";
import { z } from "zod";
import { generalInfoSchema } from "@/lib/formSchemas";

const guardianContactSchema = z.object({
  phone: generalInfoSchema.shape.phoneNumber,
  email: generalInfoSchema.shape.email,
});

type GuardianFieldErrors = Partial<
  Record<keyof z.infer<typeof guardianContactSchema>, string>
>;

interface ChildInfoCardProps {
  family: Family;
  onSave?: (updatedFamily: Family) => void;
}

function createGuardianFormState(family: Family) {
  return {
    contactName: family.contactName,
    phone: family.phone,
    email: family.email,
    relationship: "Mother", // hardcoded for now
    privateNotes: family.privateNotes || "",
  };
}

export function GuardianInfoCard({ family, onSave }: ChildInfoCardProps) {
  const [editing, setEditing] = React.useState(false);
  const [formState, setFormState] = React.useState(() =>
    createGuardianFormState(family),
  );
  const [fieldErrors, setFieldErrors] = React.useState<GuardianFieldErrors>({});

  React.useEffect(() => {
    setFormState(createGuardianFormState(family));
    setFieldErrors({});
    setEditing(false);
  }, [family]);

  const handleEditClick = () => {
    setFieldErrors({});
    setEditing(true);
  };

  const handleSave = () => {
    const validationResult = guardianContactSchema.safeParse({
      phone: formState.phone,
      email: formState.email,
    });

    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten().fieldErrors;
      setFieldErrors({
        phone: flattenedErrors.phone?.[0],
        email: flattenedErrors.email?.[0],
      });
      return;
    }

    setFieldErrors({});

    const updatedFamily: Family = {
      ...family,
      contactName: formState.contactName,
      phone: validationResult.data.phone,
      email: validationResult.data.email,
      privateNotes: formState.privateNotes,
    };

    if (onSave) onSave(updatedFamily);

    setFormState((prev) => ({
      ...prev,
      phone: validationResult.data.phone,
      email: validationResult.data.email,
    }));
    setEditing(false);
  };

  const handleCancelClick = () => {
    setFormState(createGuardianFormState(family));
    setFieldErrors({});
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormState((prev) => ({
                    ...prev,
                    contactName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-row items-center gap-2">
              <p className="font-bold">Relationship:</p>
              <EditableField
                value={formState.relationship}
                editable={editing}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormState((prev) => ({
                    ...prev,
                    relationship: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-2">
                <p className="font-bold shrink-0">Phone Number:</p>
                <EditableField
                  value={formState.phone}
                  editable={editing}
                  type="tel"
                  inputMode="tel"
                  aria-invalid={!!fieldErrors.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }));
                    setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                />
              </div>
              {editing && fieldErrors.phone && (
                <div>
                  <p className="text-xs text-destructive">
                    {fieldErrors.phone}
                  </p>
                  <p className="text-xs text-destructive">
                    Example: 123-456-7890
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-2">
                <p className="font-bold">Email:</p>
                <EditableField
                  value={formState.email}
                  editable={editing}
                  type="email"
                  inputMode="email"
                  aria-invalid={!!fieldErrors.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }));
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                />
              </div>
              {editing && fieldErrors.email && (
                <div>
                  <p className="text-xs text-destructive">
                    {fieldErrors.email}
                  </p>
                  <p className="text-xs text-destructive">
                    Example: email@example.com
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full text-sm sm:text-base text-muted-foreground mt-2">
          <p className="text-foreground text-wrap">
            <span className="font-bold">Guardian comments:</span>{" "}
            {family.privateNotes}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
