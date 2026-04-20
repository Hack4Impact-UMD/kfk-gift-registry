import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";

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
        asChild
        variant="outline"
        className="w-full h-11 rounded-lg font-semibold text-base"
      >
        <a href={familyUrl} target="_blank" rel="noreferrer">
          Open Family Account Link
        </a>
      </Button>

      <Button
        onClick={handleCopy}
        className="
          w-full 
          bg-kfk-blue text-white 
          border border-white
          hover:bg-white hover:text-kfk-blue
          hover:border-kfk-blue
          font-semibold text-base 
          flex items-center justify-center gap-2 
          h-11 rounded-lg shadow
        "
      >
        {copied ? (
          <Check className="h-5 w-5" />
        ) : (
          <Link2 className="h-5 w-5" />
        )}
        {copied ? "Link copied!" : "Copy Link"}
      </Button>
    </div>
  );
}