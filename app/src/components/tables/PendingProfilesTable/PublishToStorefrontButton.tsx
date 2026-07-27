import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePublishFamilies } from "@/hooks/mutations/usePublishFamilies";

interface PublishToStorefrontButtonProps {
  familyIds: Array<string>;
  onSuccess: () => void;
  disabled?: boolean;
  className?: string;
  onPendingChange?: (pending: boolean) => void;
}

export function PublishToStorefrontButton({
  familyIds,
  onSuccess,
  disabled = false,
  className,
  onPendingChange,
}: PublishToStorefrontButtonProps) {
  const publishFamiliesMutation = usePublishFamilies();

  useEffect(() => {
    onPendingChange?.(publishFamiliesMutation.isPending);
  }, [publishFamiliesMutation.isPending, onPendingChange]);

  return (
    <Button
      className={cn("min-w-36", className)}
      disabled={
        disabled || familyIds.length === 0 || publishFamiliesMutation.isPending
      }
      onClick={() => publishFamiliesMutation.mutate(familyIds, { onSuccess })}
    >
      {publishFamiliesMutation.isPending
        ? "Publishing..."
        : "Publish to Storefront"}
    </Button>
  );
}
