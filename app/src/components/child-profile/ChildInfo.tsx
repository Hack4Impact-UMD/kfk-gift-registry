import type { Child } from "../../../../common/src/types/child";
import type { Address, Family } from "../../../../common/src/types/family";
import { EnvelopeIcon, HomeIcon, PhoneIcon } from "@/components/icons";
import { EditableField } from "../review/EditableField";
import type { Dispatch, SetStateAction } from "react";

type ChildInfoProps = {
  child: Child;
  family: Family;
  isEditing?: boolean;
  editedChild: Partial<Child>;
  setEditedChild: Dispatch<SetStateAction<Partial<Child>>>;
  editedFamily: Partial<Family>;
  setEditedFamily: Dispatch<SetStateAction<Partial<Family>>>;
};

function formatAddress(address: Address) {
  return [
    address.street,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.zipCode}`,
  ]
    .filter(Boolean)
    .join(", ");
}

export function ChildInfo({
  child,
  family,
  isEditing,
  editedChild,
  setEditedChild,
  editedFamily,
  setEditedFamily,
}: ChildInfoProps) {
  const updateField = <K extends keyof Child>(key: K, value: Child[K]) => {
    setEditedChild((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFamilyField = <K extends keyof Family>(
    key: K,
    value: Family[K],
  ) => {
    setEditedFamily((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateAddressField = <K extends keyof Address>(
    key: K,
    value: Address[K],
  ) => {
    setEditedFamily((prev) => ({
      ...prev,
      address: {
        ...(prev.address ?? family.address),
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Child Information
        </h2>
        <div className="w-full space-y-4 rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-sm">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <span className="font-semibold">Age:</span>
              <EditableField
                value={editedChild.age ?? child.age}
                editable={isEditing}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField("age", Number(e.target.value))
                }
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <span className="font-semibold">Level:</span>
              <div className="min-w-0 flex-1">
                <EditableField
                  type="number"
                  value={editedChild.treatmentLevel ?? child.treatmentLevel}
                  editable={isEditing}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateField("treatmentLevel", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <span className="font-semibold">Diagnosis:</span>
            <EditableField
              value={editedChild.diagnosis ?? child.diagnosis}
              editable={isEditing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField("diagnosis", e.target.value)
              }
            />
          </div>
          <div className="min-w-0 truncate flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <span className="shrink-0 font-semibold">Social Worker Name:</span>
            <EditableField
              value={editedChild.childSocialWorker ?? child.childSocialWorker}
              editable={isEditing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField("childSocialWorker", e.target.value)
              }
            />
          </div>
          <div className="min-w-0 truncate flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <span className="font-semibold">Hospital:</span>
            <EditableField
              value={editedChild.hospital ?? child.hospital}
              editable={isEditing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField("hospital", e.target.value)
              }
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Guardian Contact Information
        </h2>
        <div className="w-full space-y-4 rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-sm">
          <div className="flex min-w-0 gap-2 items-start sm:items-center">
            <EnvelopeIcon className="size-5 shrink-0 text-muted-foreground" />
            <EditableField
              value={editedFamily.email ?? family.email}
              editable={isEditing}
              className="min-w-0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFamilyField("email", e.target.value)
              }
            />
          </div>
          <div className="flex min-w-0 gap-2 items-start sm:items-center">
            <PhoneIcon className="size-5 shrink-0 text-muted-foreground" />
            <EditableField
              value={editedFamily.phone ?? family.phone}
              editable={isEditing}
              className="min-w-0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFamilyField("phone", e.target.value)
              }
            />
          </div>
          <div className="flex min-w-0 gap-2 items-start">
            <HomeIcon className="mt-1 size-5 shrink-0 text-muted-foreground" />

            {!isEditing ? (
              <p className="min-w-0 py-1 break-words">
                {formatAddress(editedFamily.address ?? family.address)}
              </p>
            ) : (
              <div className="flex w-full flex-col gap-2">
                <EditableField
                  value={(editedFamily.address ?? family.address).street}
                  editable={true}
                  placeholder="Street"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateAddressField("street", e.target.value)
                  }
                />

                <EditableField
                  value={
                    (editedFamily.address ?? family.address).addressLine2 ?? ""
                  }
                  editable={true}
                  placeholder="Address Line 2"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateAddressField("addressLine2", e.target.value)
                  }
                />

                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_96px_112px]">
                  <EditableField
                    value={(editedFamily.address ?? family.address).city}
                    editable={true}
                    placeholder="City"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddressField("city", e.target.value)
                    }
                  />

                  <EditableField
                    value={(editedFamily.address ?? family.address).state}
                    editable={true}
                    placeholder="State"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddressField("state", e.target.value)
                    }
                  />

                  <EditableField
                    value={(editedFamily.address ?? family.address).zipCode}
                    editable={true}
                    placeholder="Zip"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddressField("zipCode", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
