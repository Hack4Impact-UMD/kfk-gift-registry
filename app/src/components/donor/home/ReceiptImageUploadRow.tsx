import { useId, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReceiptImageUploadRow({
  fileName,
  fileUrl,
  onFile,
  onClear,
  showClear = false,
  isUploading = false,
  disabled = false,
}: {
  fileName: string | null;
  fileUrl?: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  showClear?: boolean;
  isUploading?: boolean;
  disabled?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <Label
          htmlFor={inputId}
          className="flex shrink-0 flex-col gap-0 text-base font-medium leading-tight text-gray-800"
        >
          <span>Attach</span>
          <span>Receipt</span>
        </Label>
        <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          <div className="flex w-full items-center justify-end gap-2">
            <button
              type="button"
              disabled={disabled || isUploading}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-kfk-blue px-8 py-2 font-gaegu text-lg font-bold text-white transition-colors hover:bg-kfk-blue/80 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </button>
            {fileUrl && (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-kfk-blue px-3 py-1 text-xs font-semibold text-kfk-blue transition-colors hover:bg-kfk-blue/5"
              >
                View
              </button>
            )}
            {showClear && fileName && (
              <button
                type="button"
                onClick={onClear}
                className="text-xl leading-none font-medium text-gray-500 hover:text-gray-700"
                aria-label="Remove file"
              >
                ×
              </button>
            )}
          </div>
          {fileName && (
            <p className="max-w-56 truncate text-right text-xs text-gray-500">
              {fileName}
            </p>
          )}
        </div>
      </div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>

          {fileUrl ? (
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
