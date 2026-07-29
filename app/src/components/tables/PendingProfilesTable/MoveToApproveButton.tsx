import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApproveFamilies } from "@/hooks/mutations/useApproveFamilies";

interface MoveToApproveButtonProps {
  familyIds: Array<string>;
  onSuccess: () => void;
  disabled?: boolean;
  className?: string;
  onPendingChange?: (pending: boolean) => void;
}

export function MoveToApproveButton({
  familyIds,
  onSuccess,
  disabled = false,
  className,
  onPendingChange,
}: MoveToApproveButtonProps) {
  const approveFamiliesMutation = useApproveFamilies();

  useEffect(() => {
    onPendingChange?.(approveFamiliesMutation.isPending);
  }, [approveFamiliesMutation.isPending, onPendingChange]);

  return (
    <Button
      className={cn("min-w-36", className)}
      disabled={
        disabled || familyIds.length === 0 || approveFamiliesMutation.isPending
      }
      onClick={() => approveFamiliesMutation.mutate(familyIds, { onSuccess })}
    >
      {approveFamiliesMutation.isPending ? "Approving..." : "Approve"}
    </Button>
  );
}
