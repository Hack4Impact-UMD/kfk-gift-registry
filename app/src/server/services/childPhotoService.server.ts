import admin from "firebase-admin";

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
