import type { CartItem } from "@/local/cartCollection";
import { cartCollection } from "@/local/cartCollection";
import { queries } from "@/queries";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

type LocalCartResult = {
  data: Array<CartItem>;
};

const EMPTY_CART: Array<CartItem> = [];

let cachedSnapshot = EMPTY_CART;
let cachedSnapshotKey = "";

function readCartSnapshot() {
  const entries = Array.from(cartCollection.entries(), ([, value]) => value);
  const nextSnapshotKey = entries
    .map((item) => `${item.id}:${item.childId}:${item.familyId}`)
    .join("|");

  if (nextSnapshotKey === cachedSnapshotKey) {
    return cachedSnapshot;
  }

  cachedSnapshot = entries;
  cachedSnapshotKey = nextSnapshotKey;
  return cachedSnapshot;
}

function subscribeToCart(onStoreChange: () => void) {
  cartCollection.startSyncImmediate();
  const subscription = cartCollection.subscribeChanges(() => {
    onStoreChange();
  });

  if (cartCollection.status === "ready") {
    onStoreChange();
  }

  return () => {
    subscription.unsubscribe();
  };
}

export function useLocalCartData(): LocalCartResult {
  const data = useSyncExternalStore(
    subscribeToCart,
    readCartSnapshot,
    () => EMPTY_CART,
  );

  return { data };
}

export function useGroupedCartGifts(gifts: Array<CartItem>) {
  return useQuery({
    ...queries.gifts.cart(gifts),
    placeholderData: keepPreviousData,
  });
}
