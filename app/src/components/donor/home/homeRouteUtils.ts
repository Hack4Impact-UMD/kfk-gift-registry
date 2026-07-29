import { cn } from "@/lib/utils";

export function getGiftStatusLabel(status: string) {
  switch (status) {
    case "CLAIMED":
      return "Action Request";
    case "PURCHASED":
      return "Awaiting Purchase";
    case "DELIVERED":
    case "RECEIVED":
      return "Delivered";
    default:
      return status;
  }
}

export function getGiftStatusClass(status: string) {
  return cn(
    "rounded-full px-3 py-1 text-[12px] font-medium leading-none",
    status === "CLAIMED"
      ? "bg-[#FEF3C7] text-[#A16207]"
      : status === "PURCHASED"
        ? "bg-[#FEE2E2] text-[#EF4444]"
        : status === "DELIVERED" || status === "RECEIVED"
          ? "bg-[#DCFCE7] text-[#2E7D32]"
          : "bg-[#E5E7EB] text-[#4B5563]",
  );
}
