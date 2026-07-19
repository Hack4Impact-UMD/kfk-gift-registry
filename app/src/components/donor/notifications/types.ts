import type { ChildStatus } from "@/components/donor/home/types";
import type { DonorNotification } from "common";

export type DonorNotificationListItem = DonorNotification & {
  childName: string;
  childPhotoUrl: string;
  childCategory: ChildStatus;
  giftTitle: string;
  giftStatus: string;
  trackingNumber: string | null;
  addressLines: Array<string>;
};
