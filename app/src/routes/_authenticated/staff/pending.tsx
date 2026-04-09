import { createFileRoute } from "@tanstack/react-router";
import { PendingProfilesTable } from "@/components/tables/PendingProfilesTable/PendingProfilesTable";
import type { PendingProfileTableRow } from "@/components/tables/PendingProfilesTable/types";

export const Route = createFileRoute("/_authenticated/staff/pending")({
  component: RouteComponent,
});

const MOCK_DATA: Array<PendingProfileTableRow> = [
  { id: "0001", parentGuardian: "Jane Smith", numberOfChildren: 2, status: "pending", submissionDate: "2025-03-01T10:00:00Z", adminComments: "" },
  { id: "0002", parentGuardian: "Marcus Johnson", numberOfChildren: 1, status: "approved", submissionDate: "2025-02-28T14:30:00Z", adminComments: "All documents verified." },
  { id: "0003", parentGuardian: "Priya Patel", numberOfChildren: 3, status: "holdfile", submissionDate: "2025-02-27T09:15:00Z", adminComments: "" },
  { id: "0004", parentGuardian: "Carlos Rivera", numberOfChildren: 1, status: "pending", submissionDate: "2025-03-02T08:00:00Z", adminComments: "" },
  { id: "0005", parentGuardian: "Angela Thompson", numberOfChildren: 2, status: "approved", submissionDate: "2025-02-25T11:45:00Z", adminComments: "Reviewed and confirmed." },
  { id: "0006", parentGuardian: "David Kim", numberOfChildren: 1, status: "pending", submissionDate: "2025-03-03T16:00:00Z", adminComments: "" },
  { id: "0007", parentGuardian: "Sarah Williams", numberOfChildren: 4, status: "holdfile", submissionDate: "2025-02-20T13:00:00Z", adminComments: "Needs additional documentation." },
  { id: "0008", parentGuardian: "Michael Brown", numberOfChildren: 1, status: "approved", submissionDate: "2025-02-18T10:30:00Z", adminComments: "" },
  { id: "0009", parentGuardian: "Linda Garcia", numberOfChildren: 2, status: "pending", submissionDate: "2025-03-04T09:00:00Z", adminComments: "" },
  { id: "0010", parentGuardian: "Robert Davis", numberOfChildren: 1, status: "pending", submissionDate: "2025-03-04T12:00:00Z", adminComments: "" },
];

function RouteComponent() {
  return (
    // return <div>Hello "/_authenticated/staff/pending"!</div>;
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Approval</h1>
      </div>
      {/* TODO: header cards */}
      <PendingProfilesTable data={MOCK_DATA} />
    </div>
  );
}