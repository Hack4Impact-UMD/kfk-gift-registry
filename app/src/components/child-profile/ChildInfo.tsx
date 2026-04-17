import { Child } from "../../../../common/src/types/child";
import { Family, Address } from "../../../../common/src/types/family";
import {
    EnvelopeIcon,
    HomeIcon,
    PhoneIcon
} from "@/components/icons";
import { EditableField } from "../review/EditableField";
import { Dispatch, SetStateAction } from "react";

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

export function ChildInfo({ child, family, isEditing, editedChild, setEditedChild, editedFamily, setEditedFamily }: ChildInfoProps) {
  const updateField = <K extends keyof Child>(key: K, value: Child[K]) => {
    setEditedChild((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFamilyField = <K extends keyof Family>(
    key: K,
    value: Family[K]
  ) => {
    setEditedFamily((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateAddressField = <K extends keyof Address>(
    key: K,
    value: Address[K]
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Child Information</h2>
        <div className="shadow-md rounded-lg border p-4 space-y-2 max-w-md">
            <div className="flex gap-16 md:gap-32">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Age:</span> 
                  <EditableField 
                    value={editedChild.age ?? child.age} 
                    editable={isEditing} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("age", Number(e.target.value))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Level:</span> 
                  <EditableField 
                    value={editedChild.treatmentLevel ?? child.treatmentLevel} 
                    editable={isEditing} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateField("treatmentLevel", Number(e.target.value))
                    }
                  />
                </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Diagnosis:</span> 
              <EditableField 
                value={editedChild.diagnosis ?? child.diagnosis} 
                editable={isEditing} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField("diagnosis", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold shrink-0">Social Worker Name:</span> 
              <EditableField 
                value={editedChild.childSocialWorker ?? child.childSocialWorker} 
                editable={isEditing} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField("childSocialWorker", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Hospital:</span> 
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
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Guardian Information</h2>
        <div className="shadow-md rounded-lg border p-4 space-y-2 max-w-md">
            <div className="flex gap-2 items-center">
              <EnvelopeIcon className="size-6"/> 
              <EditableField 
                value={editedFamily.email ?? family.email} 
                editable={isEditing} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateFamilyField("email", e.target.value)
                }
              />
            </div>
            <div className="flex gap-2 items-center">
              <PhoneIcon className="size-6"/> 
              <EditableField 
                value={editedFamily.phone ?? family.phone} 
                editable={isEditing} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateFamilyField("phone", e.target.value)
                }
              />
            </div>
            <div className="flex gap-2 items-start">
              <HomeIcon className="size-6 mt-1" />

              {!isEditing ? (
                <p className="py-1 break-all">
                  {formatAddress(editedFamily.address ?? family.address)}
                </p>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <EditableField
                    value={(editedFamily.address ?? family.address).street}
                    editable={true}
                    placeholder="Street"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddressField("street", e.target.value)
                    }
                  />

                  <EditableField
                    value={(editedFamily.address ?? family.address).addressLine2 ?? ""}
                    editable={true}
                    placeholder="Address Line 2"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateAddressField("addressLine2", e.target.value)
                    }
                  />

                  <div className="flex gap-2">
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
                      className="max-w-20"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateAddressField("state", e.target.value)
                      }
                    />

                    <EditableField
                      value={(editedFamily.address ?? family.address).zipCode}
                      editable={true}
                      placeholder="Zip"
                      className="max-w-24"
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