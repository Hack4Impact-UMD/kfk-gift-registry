import { mostRecentDrive } from "@/lib/utils";
import type { GiftDrive } from "common";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

const DriveContext = createContext<
  | { activeDriveId: string | null; setActiveDriveId: (id: string) => void }
  | undefined
>(undefined);

const STORAGE_KEY = "kfk_active_drive_id";

export function DriveProvider({ children, drives }: { children: ReactNode, drives: Array<GiftDrive> }) {
  const [activeDriveId, setActiveDriveIdState] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ?? mostRecentDrive(drives).id;
  });
  const setActiveDriveId = (driveId: string) => {
    setActiveDriveIdState(driveId);
    localStorage.setItem(STORAGE_KEY, driveId);
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
