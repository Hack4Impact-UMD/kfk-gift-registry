import { DataTable } from "../DataTable";
import { columns } from "./columns";

export type ApprovedProfileTableRow = {
  id: string;
  childName: string;
  parentGuardian: string;
  email: string;
  age: number;
  diagnosis: string;
  type: "warrior" | "supersib";
  giftsFulfilled: number;
  giftsTotal: number;
};

interface ApprovedProfilesTableProps {
  data: ApprovedProfileTableRow[];
}

export function ApprovedProfilesTable({ data }: ApprovedProfilesTableProps) {
  return <DataTable columns={columns} data={data} />;
}
