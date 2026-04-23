import * as React from "react";

interface ReviewOrderContextValue {
  reviewOrder: Array<string>;
  setReviewOrder: (nextReviewOrder: Array<string>) => void;
}

const ReviewOrderContext = React.createContext<
  ReviewOrderContextValue | undefined
>(undefined);

function areOrdersEqual(
  currentOrder: Array<string>,
  nextOrder: Array<string>,
): boolean {
  if (currentOrder.length !== nextOrder.length) {
    return false;
  }

  return currentOrder.every((id, index) => id === nextOrder[index]);
}

export function ReviewOrderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reviewOrderState, setReviewOrderState] = React.useState<Array<string>>(
    [],
  );

  const setReviewOrder = React.useCallback((nextReviewOrder: Array<string>) => {
    setReviewOrderState((currentOrder) =>
      areOrdersEqual(currentOrder, nextReviewOrder)
        ? currentOrder
        : nextReviewOrder,
    );
  }, []);

  return (
    <ReviewOrderContext.Provider
      value={{
        reviewOrder: reviewOrderState,
        setReviewOrder,
      }}
    >
      {children}
    </ReviewOrderContext.Provider>
  );
}

export function useReviewOrder() {
  const context = React.useContext(ReviewOrderContext);

  if (!context) {
    throw new Error("useReviewOrder must be used within ReviewOrderProvider");
  }

  return context;
}
