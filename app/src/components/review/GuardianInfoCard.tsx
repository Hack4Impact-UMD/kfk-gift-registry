import { Card, CardContent } from "@/components/ui/card";
import type { Family } from "../../../../common/src/types/family";
import { Button } from "../ui/button";

interface ChildInfoCardProps {
  family: Family;
}

export function GuardianInfoCard({ family }: ChildInfoCardProps) {

  return (
    <Card className="w-full max-w-2xl bg-kfk-blue/5 border border-foreground">
      <CardContent className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-3xl font-bold">
                Guardian Information
            </h2>
            <Button
                type="button"
                size="xs"
                className="rounded-sm px-6"
            >
                Edit
            </Button>
        </div>

        <div className="flex bg-card px-4 sm:px-6 py-4 gap-4 -mx-6">
            <div className="flex flex-col gap-1">
                <p className="">
                    <span className="font-bold">Guardian:</span> {family.contactName}
                </p>
                <p className="" // hardcoded relationship
                >
                    <span className="font-bold">Relationship:</span> Mother
                </p>
            </div>
            <div className="flex flex-col gap-1">
                <p>
                    <span className="font-bold">Phone:</span> {family.phone}
                </p>
                <p>
                    <span className="font-bold">Email:</span> {family.email}
                </p>
            </div>
        </div>

        <div className="w-full text-sm sm:text-base text-muted-foreground mt-2">
            <p className="text-left text-foreground text-wrap"><span className="font-bold">Guardian comments:</span> {family.privateNotes}</p>
        </div>
      </CardContent>
    </Card>
  );
}
