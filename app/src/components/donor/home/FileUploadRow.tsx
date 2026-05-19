import { useId, useRef } from "react";
import { Label } from "@/components/ui/label";

export function FileUploadRow({
  fileName,
  fileUrl,
  onFile,
  onClear,
  showClear = false,
  isUploading = false,
}: {
  fileName: string | null;
  fileUrl?: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  showClear?: boolean;
  isUploading?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-row items-center gap-4">
      <Label
        htmlFor={inputId}
        className="flex shrink-0 cursor-pointer flex-col gap-0 text-base font-medium leading-tight text-gray-800"
      >
        <span>Attach</span>
        <span>Receipt</span>
      </Label>
      <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
        <div className="flex items-center gap-2 w-full justify-end">
          <button
            type="button"
            disabled={isUploading}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-kfk-blue px-8 py-2 font-gaegu text-[18px] font-bold text-white transition-colors hover:bg-kfk-blue/80 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-kfk-blue px-3 py-1 text-xs font-semibold text-kfk-blue transition-colors hover:bg-kfk-blue/5"
            >
              View
            </a>
          )}
          {showClear && fileName && (
            <button
              type="button"
              onClick={onClear}
              className="text-gray-500 hover:text-gray-700 text-xl font-medium leading-none"
              aria-label="Remove file"
            >
              ×
            </button>
          )}
        </div>
        {fileName && (
          <p className="max-w-[220px] truncate text-right text-xs text-gray-500">
            {fileName}
          </p>
        )}
      </div>
    </div>
  );
}
