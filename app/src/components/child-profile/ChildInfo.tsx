import { Child } from "../../../../common/src/types/child";
import { Family, Address } from "../../../../common/src/types/family";
import {
    EnvelopeIcon,
    HomeIcon,
    PhoneIcon
} from "@/components/icons";
import { EditableField } from "../review/EditableField";

type ChildInfoProps = {
  child: Child;
  family: Family;
  isEditing?: boolean;
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

export function ChildInfo({ child, family, isEditing }: ChildInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Child Information</h2>
        <div className="shadow-md rounded-lg border p-4 space-y-2 max-w-md">
            <div className="flex gap-16 md:gap-32">
                <p className="flex items-center gap-2">
                  <span className="font-bold">Age:</span> 
                  <EditableField value={child.age} editable={isEditing} />
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-bold">Level:</span> 
                  <EditableField 
                    value={child.treatmentLevel} 
                    editable={isEditing} 
                    //fieldType="select" 
                    //selectOptions={["A", "B", "C", "D"]} 
                    //className="min-w-30"
                  />
                </p>
            </div>
            <p className="flex items-center gap-2">
              <span className="font-bold">Diagnosis:</span> 
              <EditableField value={child.diagnosis} editable={isEditing} />
            </p>
            <p className="flex items-center gap-2">
              <span className="font-bold shrink-0">Social Worker Name:</span> 
              <EditableField value={child.childSocialWorker} editable={isEditing} />
            </p>
            <p className="flex items-center gap-2">
              <span className="font-bold">Hospital:</span> 
              <EditableField value={child.hospital} editable={isEditing} />
            </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Guardian Information</h2>
        <div className="shadow-md rounded-lg border p-4 space-y-2 max-w-md">
            <p className="flex gap-2 items-center">
              <EnvelopeIcon className="size-6"/> 
              <EditableField value={family.email} editable={isEditing} />
            </p>
            <p className="flex gap-2 items-center">
              <PhoneIcon className="size-6"/> 
              <EditableField value={family.phone} editable={isEditing} />
            </p>
            <p className="flex gap-2 items-center">
              <HomeIcon className="size-6"/> 
              <EditableField value={formatAddress(family.address)} editable={isEditing} />
            </p>
        </div>
      </div>
    </div>
  );
}