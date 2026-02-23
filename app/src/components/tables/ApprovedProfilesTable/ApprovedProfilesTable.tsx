import { useState } from "react";
import { ExternalLink, Search, Undo2 } from "lucide-react";
import { DataTable } from "../DataTable";
import { columns } from "./columns";
import type { ApprovedProfileTableRow } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ApprovedProfilesTableProps {
  data: Array<ApprovedProfileTableRow>;
  className?: string;
}

export function ApprovedProfilesTable({
  data,
  className = "",
}: ApprovedProfilesTableProps) {
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <div className={cn("flex flex-col gap-4 pt-6", className)}>
      <div className="flex items-center">
        <div className="relative flex items-center mr-auto ml-6 w-48">
          <Search className="absolute ml-2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-7 border-gray-400 text-gray-500"
          />
        </div>
        <div className="flex gap-6 ml-auto mr-6">
          <Button variant="outline">
            <Undo2 className="h-4 w-4" />
            Withdraw Approval
          </Button>
          <Button>
            <ExternalLink className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
      />
    </div>
  );
}
