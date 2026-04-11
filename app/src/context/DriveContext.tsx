import { mostRecentDrive } from "@/lib/utils";
import type { GiftDrive } from "common";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

const DriveContext = createContext<
  | { activeDriveId: string | null; setActiveDriveId: (id: string) => void }
  | undefined
>(undefined);

export function DriveProvider({ children, drives }: { children: ReactNode, drives: Array<GiftDrive> }) {
  const [activeDriveId, setActiveDriveIdState] = useState<string | null>(() => {
    return mostRecentDrive(drives)?.id ?? null;
  });
  const setActiveDriveId = (driveId: string) => {
    setActiveDriveIdState(driveId);
  };

  return (
    <DriveContext.Provider value={{ activeDriveId, setActiveDriveId }}>
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  // just created a hook for easy access
  const context = useContext(DriveContext);
  if (context == undefined) {
    throw new Error("useDrive not used within DriveProvider");
  }
  return context;
}
