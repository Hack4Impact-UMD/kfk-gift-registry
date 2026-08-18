import type { MouseEventHandler, ReactNode } from "react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  className?: string;
  stopPropagation?: boolean;
  children?: ReactNode;
  ariaLabel?: string;
}

export function CopyButton({
  text,
  className,
  children,
  stopPropagation = false,
  ariaLabel,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy: MouseEventHandler<HTMLButtonElement> = async (e) => {
    if (stopPropagation) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleCopy}
      aria-label={ariaLabel ?? "Copy to clipboard"}
    >
      {children}
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 text-gray-500" />
      )}
    </Button>
  );
}
