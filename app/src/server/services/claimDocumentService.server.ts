import admin from "firebase-admin";

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
const BASE64_DOCUMENT_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadClaimDocument(
  claimId: string,
  fileName: string,
  dataUrl: string,
): Promise<string> {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx === -1) throw new Error("Invalid document data URL");

  const header = dataUrl.slice(0, commaIdx);
  const base64Data = dataUrl.slice(commaIdx + 1);
  const mimeType = header.match(/data:([^;]+);/)?.[1];

  if (
    !mimeType ||
    !(ALLOWED_DOCUMENT_MIME_TYPES as ReadonlyArray<string>).includes(mimeType)
  ) {
    throw new Error(`Unsupported document type: ${mimeType ?? "unknown"}`);
  }

  if (!BASE64_DOCUMENT_PATTERN.test(base64Data)) {
    throw new Error("Invalid document data URL");
  }
  // Calculate the expected decoded size of the base64 data and check if it exceeds the limit
  const paddingLength = base64Data.endsWith("==")
    ? 2
    : base64Data.endsWith("=")
      ? 1
      : 0;
  const expectedDecodedSize = (base64Data.length * 3) / 4 - paddingLength;

  if (expectedDecodedSize > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("Document exceeds the 10 MB size limit");
  }

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.byteLength > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("Document exceeds the 10 MB size limit");
  }

  const safeFileName = sanitizeFileName(fileName);
  const bucket = admin.storage().bucket();
  const file = bucket.file(
    `claims/purchase-confirmations/${claimId}/${Date.now()}-${safeFileName}`,
  );

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      claimId,
      originalFileName: fileName,
    },
  });
  await file.makePublic();

  return file.publicUrl();
}
