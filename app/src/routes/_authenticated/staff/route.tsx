import { Outlet, createFileRoute, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { UserRole } from "common";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StaffSidebar } from "@/components/StaffSidebar/StaffSidebar";
import { DriveProvider } from "@/context/DriveContext";
import { queries } from "@/queries";
import { useAllGiftDrives } from "@/hooks/queries/useAllGiftDrives";
import z from "zod";

const searchSchema = z.object({
  drive: z.string().optional()
})

export const Route = createFileRoute("/_authenticated/staff")({
  beforeLoad: ({ context }) => {
    if (context.auth.authUser.role === UserRole.DONOR) {
      throw redirect({
        to: "/",
      });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(queries.drives.all)
  },
  validateSearch: searchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = useState(true);
  const { currentDrive } = Route.useRouteContext();
  const { data: drives } = useAllGiftDrives();
  const { drive } = Route.useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <DriveProvider drives={drives ?? []} initialDriveId={drive} onDriveChange={driveId => {
      navigate({
        to: location.pathname,
        search: { drive: driveId }
      })
    }}>
      <div>
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <div className="flex flex-row w-full h-full">
            <StaffSidebar currentDrive={currentDrive} />
            <main className="flex-1 min-w-0">
              <div className="w-full bg-accent border-b block md:hidden">
                <SidebarTrigger
                  openIcon={<XIcon />}
                  closeIcon={<MenuIcon />}
                />
              </div>
              <div className="p-4">
                <Outlet />
              </div>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </DriveProvider>
  );
}
