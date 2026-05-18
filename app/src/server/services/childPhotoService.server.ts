import admin from "firebase-admin";

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
type AllowedMimeType = (typeof ALLOWED_PHOTO_MIME_TYPES)[number];
const MIME_TO_EXT: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Uploads a data URL to GCS via the Admin SDK and returns a permanent public URL.
// Write access is admin-SDK-only; the object is made publicly readable for display.
export async function uploadChildPhoto(
  childId: string,
  dataUrl: string,
): Promise<string> {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx === -1) throw new Error("Invalid photo data URL");

  const header = dataUrl.slice(0, commaIdx);
  const base64Data = dataUrl.slice(commaIdx + 1);
  const mimeType = header.match(/data:([^;]+);/)?.[1];

  if (
    !mimeType ||
    !(ALLOWED_PHOTO_MIME_TYPES as ReadonlyArray<string>).includes(mimeType)
  ) {
    throw new Error(`Unsupported photo type: ${mimeType ?? "unknown"}`);
  }

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.byteLength > MAX_PHOTO_SIZE_BYTES) {
    throw new Error(`Photo exceeds the 5 MB size limit`);
  }

  const ext = MIME_TO_EXT[mimeType as AllowedMimeType];
  const bucket = admin.storage().bucket();
  const file = bucket.file(`children/pfps/${childId}.${ext}`);

  await file.save(buffer, {
    metadata: { contentType: mimeType, childId: childId },
  });
  await file.makePublic();

  return file.publicUrl();
}
