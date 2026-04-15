import { Child } from "../../../../common/src/types/child";
import { Family, Address } from "../../../../common/src/types/family";
import {
    EnvelopeIcon,
    HomeIcon,
    PhoneIcon
} from "@/components/icons";

type ChildInfoProps = {
  child: Child;
  family: Family
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

export function ChildInfo({ child, family }: ChildInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Child Information</h2>
        <div className="shadow-md rounded-lg border p-4 space-y-2 max-w-md">
            <div className="flex gap-16 md:gap-32">
                <p><span className="font-bold">Age:</span> {child.age}</p>
                <p><span className="font-bold">Level:</span> {child.treatmentLevel}</p>
            </div>
            <p><span className="font-bold">Diagnosis:</span> {child.diagnosis}</p>
            <p><span className="font-bold">Social Worker Name:</span> {child.childSocialWorker}</p>
            <p><span className="font-bold">Hospital:</span> {child.hospital}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-2xl">Guardian Information</h2>
        <div className="shadow-md rounded-lg border p-4 space-y-2 max-w-md">
            <p className="flex gap-2 items-center"><EnvelopeIcon className="size-6"/>{family.email}</p>
            <p className="flex gap-2 items-center"><PhoneIcon className="size-6"/> {family.phone}</p>
            <p className="flex gap-2 items-center"><HomeIcon className="size-6"/> {formatAddress(family.address)}</p>
        </div>
      </div>
    </div>
  );
}