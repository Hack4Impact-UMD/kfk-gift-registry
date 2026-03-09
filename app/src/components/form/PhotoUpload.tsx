import { useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PhotoUploadProps {
  field: any;
  label?: string;
  childName?: string;
}

export function PhotoUpload({
  field,
  label = "Photo",
  childName = "Child",
}: PhotoUploadProps) {
  // Restore preview from form state (e.g. user navigated back to this page)
  const existingValue = field.state.value as string | undefined;
  const [preview, setPreview] = useState<string | null>(
    existingValue && existingValue.startsWith("data:") ? existingValue : null
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      field.handleChange(result);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    setError(null);
    field.handleChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-600">{label} (Optional)</p>

      {/* Hidden file input — triggered by button click or drag-and-drop */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label={`Upload photo for ${childName}`}
      />

      {preview ? (
        <div className="space-y-2">
          <div className="relative w-full">
            <img
              src={preview}
              alt={`${childName} photo preview`}
              className="w-full h-40 object-cover rounded-lg border border-slate-200"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              aria-label={`Remove ${childName} photo`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Allow replacing the photo after selection */}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] hover:bg-blue-50 hover:text-[var(--color-kfk-blue)]"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Replace Photo
          </Button>
        </div>
      ) : (
        // Drag-and-drop target — visually just the button, but the whole area accepts drops
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] hover:bg-blue-50 hover:text-[var(--color-kfk-blue)] transition-colors ${
              isDragging ? "bg-blue-50 border-blue-600" : ""
            }`}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
