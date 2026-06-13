import admin from "firebase-admin";

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
export type ClaimDocumentType =
  | "purchase-confirmations"
  | "delivery-confirmations";

// Uploads a claim document and returns the GCS object name (path within the bucket).
// Using the claimId as the filename ensures re-uploads overwrite the previous file
// rather than accumulating orphaned objects.
// The object is stored as private; clients resolve it to a download URL via
// the Firebase Storage SDK, which evaluates storage.rules against their auth token.
export async function uploadClaimDocument(
  donorId: string,
  claimId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string,
  documentType: ClaimDocumentType,
): Promise<string> {
  if (
    !(ALLOWED_DOCUMENT_MIME_TYPES as ReadonlyArray<string>).includes(mimeType)
  ) {
    throw new Error(`Unsupported document type: ${mimeType}`);
  }

  if (buffer.byteLength > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("Document exceeds the 10 MB size limit");
  }

  const bucket = admin.storage().bucket();
  const objectName = `claims/${documentType}/${donorId}/${claimId}`;
  const file = bucket.file(objectName);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        donorId,
        claimId,
        originalFileName: fileName,
      },
    },
  });

  return objectName;
}
