import {
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { UserRole } from "common";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StaffSidebar } from "@/components/StaffSidebar/StaffSidebar";
import { DriveProvider } from "@/context/DriveContext";
import { ReviewOrderProvider } from "@/context/ReviewOrderContext";
import { queries } from "@/queries";
import { useAllGiftDrives } from "@/hooks/queries/useAllGiftDrives";
import z from "zod";

const searchSchema = z.object({
  drive: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/staff")({
  beforeLoad: ({ context }) => {
    if (context.auth.authUser.role === UserRole.DONOR) {
      throw redirect({
        to: "/",
      });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(queries.drives.all);
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
    <DriveProvider
      drives={drives ?? []}
      initialDriveId={drive}
      onDriveChange={(driveId) => {
        navigate({
          to: location.pathname,
          search: { drive: driveId },
        });
      }}
    >
      <ReviewOrderProvider>
        <div>
          <SidebarProvider className="h-svh" open={open} onOpenChange={setOpen}>
            <div className="flex h-full w-full flex-row">
              <StaffSidebar currentDrive={currentDrive} />
              <main className="flex min-w-0 flex-1 flex-col">
                <div className="w-full bg-accent border-b block md:hidden">
                  <SidebarTrigger
                    closeIcon={<XIcon />}
                    openIcon={<MenuIcon />}
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col p-4">
                  <Outlet />
                </div>
              </main>
            </div>
          </SidebarProvider>
        </div>
      </ReviewOrderProvider>
    </DriveProvider>
  );
}
