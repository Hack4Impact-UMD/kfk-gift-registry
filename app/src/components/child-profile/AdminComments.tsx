import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface AdminCommentsProps {
  initialComments?: string;
  onSave: (comments: string) => void;
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
    debounceRef.current = setTimeout(() => {
      setSaveStatus("saving");
      onSave(newValue);
      setTimeout(() => setSaveStatus("saved"), 400);
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, debounceMs);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold">Admin Comments</CardTitle>
        <span className="text-xs text-gray-400">
          {saveStatus === "saving" && "Saving…"}
          {saveStatus === "saved" && "Saved ✓"}
        </span>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder="Add internal admin notes here…"
          className="min-h-[120px] resize-none text-sm"
        />
      </CardContent>
    </Card>
  );
}