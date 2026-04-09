import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

const DriveContext = createContext<
  { activeDriveId: string; setActiveDriveId: (id: string) => void } | undefined
>(undefined);

const STORAGE_KEY = "kfk_active_drive_id";
const DEFAULT_DRIVE_ID = "gd_seed_spring_2026_1"; // matches seeded gift drive ID

export function DriveProvider({ children }: { children: ReactNode }) {
  const [activeDriveId, setActiveDriveIdState] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || DEFAULT_DRIVE_ID;
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
