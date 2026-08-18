import { useId, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStorageUrl } from "@/hooks/useStorageUrl";

export function ReceiptImageUploadRow({
  fileName,
  filePath,
  onFile,
  onClear,
  showClear = false,
  isUploading = false,
  disabled = false,
  label,
}: {
  fileName: string | null;
  filePath?: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  showClear?: boolean;
  isUploading?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileUrl = useStorageUrl(filePath ?? null);
  // Storage paths carry no extension, so the stored file name is the only hint
  // about which of the accepted types (image or PDF) this receipt is.
  const isPdf = fileName?.toLowerCase().endsWith(".pdf") ?? false;

  return (
    <>
      <div className="grid w-full grid-cols-[72px_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
        <Label
          htmlFor={inputId}
          className="pt-1 text-[14px] font-normal leading-5 text-[#4B5563]"
        >
          {label || "Attach Receipt"}
        </Label>
        <div className="min-w-0">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              disabled={disabled || isUploading}
              className="h-10 min-w-[160px] rounded-[12px] bg-kfk-blue px-5 font-gaegu text-[18px] font-bold text-white transition-colors hover:bg-kfk-blue/80 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
            {fileUrl ? (
              <Button
                variant="outline"
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="h-9 rounded-[10px] border border-kfk-blue px-3 text-xs font-semibold text-kfk-blue transition-colors hover:bg-kfk-blue/5"
              >
                View
              </Button>
            ) : null}
            {showClear && fileName ? (
              <Button
                type="button"
                onClick={onClear}
                className="h-9 px-2 text-xl font-medium leading-none text-gray-500 hover:text-gray-700"
                aria-label="Remove file"
              >
                ×
              </Button>
            ) : null}
          </div>
          {fileName ? (
            <p className="mt-1 truncate text-right text-xs text-gray-500">
              {fileName}
            </p>
          ) : null}
        </div>
      </div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>

          {fileUrl && isPdf ? (
            <div className="flex flex-col gap-2">
              <iframe
                src={fileUrl}
                title="Receipt preview"
                className="h-[70vh] w-full rounded border border-gray-200"
              />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-sm font-semibold text-kfk-blue underline"
              >
                Open in a new tab
              </a>
            </div>
          ) : fileUrl ? (
            <img src={fileUrl} alt="Receipt preview" className="w-full" />
          ) : (
            <div className="flex h-40 items-center justify-center bg-gray-200">
              No file
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
