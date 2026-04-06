import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const DriveContext = createContext<
  {activeDriveId: string; setActiveDriveId: (id: string) => void} | undefined
>(undefined);

const STORAGE_KEY = "kfk_active_drive_id";
const DEFAULT_DRIVE_ID = "gift-drive-2026"; // setting as the def for now

export function DriveProvider({ children }: { children: ReactNode }) {
  const [activeDriveId, setActiveDriveIdState] = useState<string>(DEFAULT_DRIVE_ID);
  const [isLoaded, setIsLoaded] = useState(false); // tracking if it's been loaded from storage yet 

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setActiveDriveIdState(stored);
    }
    setIsLoaded(true);
  }, []);

  const setActiveDriveId = (driveId: string) => {
    setActiveDriveIdState(driveId);
    localStorage.setItem(STORAGE_KEY, driveId);
  };
  if (!isLoaded) {
    return null;
  }

  return (
    <DriveContext.Provider value={{ activeDriveId, setActiveDriveId }}>
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() { // just created a hook for easy access
  const context = useContext(DriveContext);
  if (context == undefined) {
    throw new Error("useDrive not used within DriveProvider");
  }
  return context;
}
