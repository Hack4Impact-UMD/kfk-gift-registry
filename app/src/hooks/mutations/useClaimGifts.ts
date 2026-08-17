import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  claimGifts,
  markGiftDelivered,
  markGiftPurchased,
  updateGiftTrackingNumber,
  unclaimGifts,
  uploadPurchaseReceipt,
  uploadDeliveryReceipt,
} from "@/server/functions/donor";
import { getClientStorage, getClientAuth } from "@/lib/firebase";
import { queries } from "@/queries";
import { storageUrlKey } from "@/hooks/useStorageUrl";
import { toast } from "@/lib/toast";

export function useClaimGifts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftIds: Array<string>) => claimGifts({ data: { giftIds } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
    },
  });
}

export function useUnclaimGifts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftIds: Array<string>) => unclaimGifts({ data: { giftIds } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      toast.success("Gift unclaimed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unclaim gift");
    },
  });
}

export function useMarkGiftPurchased() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftId: string) => markGiftPurchased({ data: { giftId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      toast.success("Gift marked as purchased");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark gift as purchased");
    },
  });
}

export function useMarkGiftDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (giftId: string) => markGiftDelivered({ data: { giftId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      toast.success("Gift marked as delivered");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark gift as delivered");
    },
  });
}

export function useUploadPurchaseReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      giftId: string;
      file: File;
      trackingNumber?: string;
    }) => {
      const auth = await getClientAuth();
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Not authenticated");

      const storage = await getClientStorage();
      const storageRef = ref(
        storage,
        `claims/purchase-confirmations/${uid}/${params.giftId}`,
      );
      await uploadBytes(storageRef, params.file);
      // Overwriting a path mints a new download token, so cache the fresh URL
      // to keep the browser from serving the previous receipt from cache.
      queryClient.setQueryData(
        storageUrlKey(storageRef.fullPath),
        await getDownloadURL(storageRef),
      );

      return uploadPurchaseReceipt({
        data: {
          giftId: params.giftId,
          documentationPath: storageRef.fullPath,
          trackingNumber: params.trackingNumber,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      toast.success("Receipt uploaded");
    },
    onError: (error) => {
      console.error(error);
      toast.error(
        error.message ??
          "Failed to upload receipt. Make sure the file size is less than 10MB.",
      );
    },
  });
}

export function useUploadDeliveryReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { giftId: string; file: File }) => {
      const auth = await getClientAuth();
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Not authenticated");

      const storage = await getClientStorage();
      const storageRef = ref(
        storage,
        `claims/delivery-confirmations/${uid}/${params.giftId}`,
      );
      await uploadBytes(storageRef, params.file);
      queryClient.setQueryData(
        storageUrlKey(storageRef.fullPath),
        await getDownloadURL(storageRef),
      );

      return uploadDeliveryReceipt({
        data: { giftId: params.giftId, documentationPath: storageRef.fullPath },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      toast.success("Delivery receipt uploaded");
    },
    onError: (error) => {
      console.error(error);
      toast.error(
        error.message ??
          "Failed to upload delivery confirmation. Make sure the file size is less than 10MB.",
      );
    },
  });
}

export function useUpdateGiftTrackingNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { giftId: string; trackingNumber: string }) =>
      updateGiftTrackingNumber({ data: params }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.donor._def });
      await queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      });
      await queryClient.invalidateQueries({ queryKey: queries.gifts._def });
      toast.success("Tracking number saved");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save tracking number");
    },
  });
}
