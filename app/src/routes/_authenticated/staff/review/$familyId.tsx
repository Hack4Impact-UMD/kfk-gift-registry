import { createFileRoute } from "@tanstack/react-router";
import type { Family } from "../../../../../../common/src/types/family";
import { GuardianInfoCard } from "@/components/review/GuardianInfoCard";
import * as React from "react";
import { ChildCard } from "@/components/review/ChildCard";
import { Gift } from "node_modules/common/src/types/gift";

export const Route = createFileRoute("/_authenticated/staff/review/$familyId")({
  component: RouteComponent,
});

export type ReviewChild = {
  id: string;
  childName: string;
  status: "Warrior" | "Supersib";
  treatmentLength?: string;
  diagnosis?: string;
  age: number;
  level: string;
  blurb: string;
  gifts: Array<Gift>;
  socialWorkerName?: string;
  hospitalName?: string;
};

export const MOCK_CHILD: ReviewChild = {
  id: "john-smith",
  childName: "John Smith",
  status: "Warrior",
  treatmentLength: "2 weeks",
  diagnosis: "Leukemia",
  age: 6,
  level: "B",
  blurb:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
  gifts: [],
  socialWorkerName: "Amanada Reese",
  hospitalName: "Children National Hospital",
};

const mockFamily: Family = {
  id: "family123",
  contactName: "Anna Smith",
  email: "AnnaSmith@gmail.com",
  phone: "123-456-7890",
  giftDrive: "gd_seed_fall_2025_2",
  createdAt: "2025-09-13T05:00:27.182Z",

  address: {
    street: "629 N Walnut Street",
    city: "Dellbury",
    state: "PA",
    zipCode: "10087",
  },

  reviewStatus: {
    approved: true,
    held: false,
    lastReviewedAt: "2025-10-19T19:53:02.455Z",
    reviewedBy: "director_1",
    reviewNotes: "Family information verified by staff intake.",
  },

  privateNotes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis",
};

function RouteComponent() {
  const lastName = mockFamily.contactName.trim().split(/\s+/).pop() ?? "";
  const [familyData, setFamilyData] = React.useState<Family>(mockFamily);
  const [childData, setChildData] = React.useState<ReviewChild>(MOCK_CHILD);

  const handleFamilyUpdate = (updatedFamily: Family) => {
    // update database
    setFamilyData(updatedFamily);
  };

  const handleChildUpdate = (updatedChild: ReviewChild) => {
    setChildData(updatedChild);
  }

  return (
    <div>
      <h1 className="text-4xl ml-16 mt-6 font-bold">{lastName} Family</h1>
      <div className="shadow-xl border max-w-3xl rounded-md p-8 mt-6 ml-6 flex flex-col gap-5 justify-center">
        <GuardianInfoCard family={familyData} onSave={handleFamilyUpdate} />
        <ChildCard child={childData} onSave={handleChildUpdate}></ChildCard>
      </div>
    </div>
  );
}