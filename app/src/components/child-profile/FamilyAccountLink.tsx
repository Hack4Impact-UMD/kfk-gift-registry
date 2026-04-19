import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

interface FamilyAccountLinkProps {
  familyToken: string;
}

export function FamilyAccountLink({ familyToken }: FamilyAccountLinkProps) {
  const [copied, setCopied] = useState(false);
  const familyUrl = `${window.location.origin}/family/${familyToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(familyUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = familyUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-semibold text-gray-800">
        Link to access family account page:
      </p>

      <Button
        onClick={handleCopy}
        className="w-full bg-kfk-blue text-white hover:bg-kfk-blue/90 font-gaegu font-bold flex items-center justify-center gap-2 h-10 rounded-lg shadow"
      >
        <Link2 className="h-4 w-4" />
        {copied ? "Copied!" : "Copy Link"}
      </Button>
    </div>
  );
}