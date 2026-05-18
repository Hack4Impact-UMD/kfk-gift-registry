import admin from "firebase-admin";

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
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

  const bucket = admin.storage().bucket();
  const file = bucket.file(`children/pfps/${childId}`);

  await file.save(buffer, {
    metadata: { contentType: mimeType, childId: childId },
  });
  await file.makePublic();

  return file.publicUrl();
}

export async function childPhotoExists(childId: string): Promise<boolean> {
  const bucket = admin.storage().bucket();
  const file = bucket.file(`children/pfps/${childId}`);

  return (await file.exists())[0];
}

export async function deleteChildPhoto(childId: string): Promise<void> {
  const bucket = admin.storage().bucket();
  const file = bucket.file(`children/pfps/${childId}`);
  await file.delete({ ignoreNotFound: true });
}
