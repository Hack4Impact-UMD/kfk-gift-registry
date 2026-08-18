// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  useUploadDeliveryReceipt,
  useUploadPurchaseReceipt,
} from "./useClaimGifts";
import { storageUrlKey } from "@/hooks/useStorageUrl";

// vi.mock factories are hoisted above module-scope consts, so the spies they
// close over have to be created with vi.hoisted.
const {
  uploadBytes,
  getDownloadURL,
  uploadPurchaseReceipt,
  uploadDeliveryReceipt,
} = vi.hoisted(() => ({
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  uploadPurchaseReceipt: vi.fn(),
  uploadDeliveryReceipt: vi.fn(),
}));

vi.mock("firebase/storage", () => ({
  ref: (_storage: unknown, path: string) => ({ fullPath: path }),
  uploadBytes,
  getDownloadURL,
}));

vi.mock("@/lib/firebase", () => ({
  getClientAuth: async () => ({ currentUser: { uid: "donor-1" } }),
  getClientStorage: async () => ({}),
}));

vi.mock("@/server/functions/donor", () => ({
  claimGifts: vi.fn(),
  markGiftDelivered: vi.fn(),
  markGiftPurchased: vi.fn(),
  updateGiftTrackingNumber: vi.fn(),
  unclaimGifts: vi.fn(),
  uploadPurchaseReceipt,
  uploadDeliveryReceipt,
}));

vi.mock("@/lib/toast", () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

const file = new File(["receipt"], "receipt.png", { type: "image/png" });

const cases = [
  {
    name: "purchase receipt",
    hook: useUploadPurchaseReceipt,
    serverFn: uploadPurchaseReceipt,
    path: "claims/purchase-confirmations/donor-1/gift-1",
    variables: { giftId: "gift-1", file, trackingNumber: "1Z999" },
  },
  {
    name: "delivery receipt",
    hook: useUploadDeliveryReceipt,
    serverFn: uploadDeliveryReceipt,
    path: "claims/delivery-confirmations/donor-1/gift-1",
    variables: { giftId: "gift-1", file },
  },
] as const;

describe.each(cases)("$name upload", ({ hook, serverFn, path, variables }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadBytes.mockResolvedValue(undefined);
    uploadPurchaseReceipt.mockResolvedValue({ documentationPath: path });
    uploadDeliveryReceipt.mockResolvedValue({ documentationPath: path });
  });

  it("records the receipt and caches the fresh download URL", async () => {
    getDownloadURL.mockResolvedValue("https://example.com/receipt?token=new");
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(storageUrlKey(path), "https://example.com/old");

    const { result } = renderHook(() => hook(), { wrapper });
    result.current.mutate(variables as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(serverFn).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(storageUrlKey(path))).toBe(
      "https://example.com/receipt?token=new",
    );
  });

  it("still records the receipt when the download URL cannot be fetched", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getDownloadURL.mockRejectedValue(new Error("storage/unauthorized"));
    const { queryClient, wrapper } = makeWrapper();
    queryClient.setQueryData(storageUrlKey(path), "https://example.com/old");

    const { result } = renderHook(() => hook(), { wrapper });
    result.current.mutate(variables as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(serverFn).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryState(storageUrlKey(path))?.isInvalidated).toBe(
      true,
    );
  });
});
