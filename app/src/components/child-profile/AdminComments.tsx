import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface AdminCommentsProps {
  initialComments?: string;
  onSave: (comments: string) => void | Promise<void>;
  debounceMs?: number;
}

export function AdminComments({
  initialComments = "",
  onSave,
  debounceMs = 1500,
}: AdminCommentsProps) {
  const [value, setValue] = useState(initialComments);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(initialComments);
  }, [initialComments]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setSaveStatus("idle");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await onSave(newValue);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1600);
      } catch {
        setSaveStatus("idle");
      }
    }, debounceMs);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Admin Comments</h3>
        <span className="text-xs text-gray-400">
          {saveStatus === "saving" && "Saving…"}
          {saveStatus === "saved" && "Saved ✓"}
        </span>
      </div>

      <div className="w-full rounded-xl border bg-white shadow-sm p-4">
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder="Add internal admin notes here…"
          className="min-h-[130px] resize-none text-sm border-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
        />
      </div>
    </div>
  );
}