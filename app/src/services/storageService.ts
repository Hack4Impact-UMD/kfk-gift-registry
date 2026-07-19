import { getClientStorage } from "@/lib/firebase";
import type { StorageReference, UploadTaskSnapshot } from "firebase/storage"
import { ref, uploadBytesResumable } from "firebase/storage";
import Compressor from "compressorjs"

export async function uploadFile(file: Blob, path: string, metadata: Record<string, string>, onProgress?: (snap: UploadTaskSnapshot) => void): Promise<StorageReference> {
  const storage = await getClientStorage();

  const uploadRef = ref(storage, path);
  const task = uploadBytesResumable(uploadRef, file, {
    customMetadata: metadata
  })

  return new Promise((resolve, reject) => {
    task.on('state_changed', onProgress, err => reject(err), () => resolve(uploadRef))
  })
}

async function compressImage(dataUrl?: string): Promise<Blob | null> {
  if (!dataUrl) return null;
  const blob = await (await fetch(dataUrl)).blob();

  return new Promise((resolve, reject) => {
    new Compressor(blob, {
      quality: 0.7,
      success: (file) => {
        resolve(file);
      },
      error: (err) => reject(err),
    });
  });
}

export async function uploadChildProfilePicture(childId: string, imageDataURL: string) {
  const compressedImage = await compressImage(imageDataURL);
  const path = `children/pfps/${childId}`

  if (!compressedImage) throw new Error("Failed to compress image");
  return await uploadFile(compressedImage, path, {}, snap => console.log(snap));
}
