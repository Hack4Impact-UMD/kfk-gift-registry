import { useState } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { UserRole } from "common";
import KFKLogo from "@/assets/kfk-logo.png";
import { useDrive } from "@/context/DriveContext";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  CalendarIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ClipboardCheckIcon,
  ClipboardIcon,
  GiftIcon,
  HomeIcon,
  UsersIcon,
} from "@/components/icons";
import { useAllGiftDrives } from "@/hooks/queries/useAllGiftDrives";
import type { GiftDrive } from "common";
import { LinkIcon, Settings, UserCircleIcon } from "lucide-react";

// Tooltip wrapper for sidebar menu items to show labels only when collapsed
function SidebarMenuButtonWithTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (!isCollapsed) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex">{children}</div>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

interface SidebarMenuButtonProps {
  children: React.ReactNode;
}
const SidebarMenuButtonWithHovering = ({
  children,
}: SidebarMenuButtonProps) => {
  return (
    <SidebarMenuButton
      asChild
      size={"lg"}
      className={
        "group/button transition min-h-12 min-w-12 flex items-center gap-2 group-data-[collapsible=icon]:justify-center hover:text-current"
      }
    >
      {children}
    </SidebarMenuButton>
  );
};

export function StaffSidebar({ currentDrive }: { currentDrive?: GiftDrive }) {
  const { auth } = useRouteContext({ from: "/_authenticated" });
  const user = auth.authUser;
  const canAccessAdmin =
    user.role === UserRole.DIRECTOR || user.role === UserRole.ADMIN;
  const { activeDriveId, setActiveDriveId } = useDrive();
  const [, setIsDropdownPressed] = useState<boolean>(false);
  const { data: drives, isPending, error } = useAllGiftDrives();

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarTrigger
        openIcon={
          <ChevronDoubleRightIcon className="transition-colors size-6" />
        }
        closeIcon={
          <ChevronDoubleLeftIcon className="transition-colors size-6" />
        }
        className="absolute top-4 right-4 rounded transition-colors duration-200 hover:bg-black hover:text-white"
      />
      <SidebarHeader className="border-b px-4 py-8 mt-4 flex flex-col items-center gap-[15px]">
        <img
          src={KFKLogo}
          alt="Kisses For Kyle"
          className="h-12.75 w-51.25 object-contain opacity-100 group-data-[collapsible=icon]:opacity-0"
        />

        <div
          className="bg-black text-white flex items-center justify-center w-[205px] h-[48px] rounded-[10px] gap-[8px]
                 opacity-100 group-data-[collapsible=icon]:opacity-0"
        >
          <span className="text-lg font-semibold text-center">
            Gift Registry
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="flex-col gap-2">
            <SidebarMenuItem className="flex group-data-[collapsible=icon]:justify-center">
              <SidebarMenuButton asChild size="lg">
                <Select
                  onOpenChange={setIsDropdownPressed}
                  value={activeDriveId ?? currentDrive?.id}
                  onValueChange={setActiveDriveId}
                >
                  <SidebarMenuButtonWithTooltip label="Drive">
                    <SelectTrigger
                      chevron={false}
                      className="w-full group/button flex items-center justify-start gap-2 group-data-[collapsible=icon]:min-w-12 min-h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                    >
                      <CalendarIcon className="transition-colors text-black size-6" />

                      <span className="truncate group-data-[collapsible=icon]:hidden group-data-[status=active]/button:text-kfk-blue">
                        {isPending ? (
                          "Loading..."
                        ) : error ? (
                          `Failed to load gift drives: ${error.message}`
                        ) : (
                          <SelectValue placeholder="No active drive" />
                        )}
                      </span>
                    </SelectTrigger>
                  </SidebarMenuButtonWithTooltip>
                  <SelectContent>
                    {drives?.map((drive) => (
                      <SelectItem key={drive.id} value={drive.id}>
                        {drive.cycle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Home">
                <SidebarMenuButtonWithHovering>
                  <Link
                    to="/staff/home"
                    className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                    activeProps={{
                      className:
                        "group/button flex items-center gap-2 text-kfk-red hover:text-kfk-red",
                    }}
                  >
                    <HomeIcon className="transition-colors size-6" />
                    <span className={`group-data-[collapsible=icon]:hidden`}>
                      Home
                    </span>
                  </Link>
                </SidebarMenuButtonWithHovering>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Family Approval">
                <SidebarMenuButtonWithHovering>
                  <Link
                    to="/staff/family-approval"
                    className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                    activeProps={{
                      className:
                        "group/button flex items-center gap-2 text-kfk-yellow hover:text-kfk-yellow",
                    }}
                  >
                    {/* Placeholder Link */}
                    <ClipboardIcon className="transition-colors size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Family Approval
                    </span>
                  </Link>
                </SidebarMenuButtonWithHovering>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Child Profiles">
                <SidebarMenuButtonWithHovering>
                  <Link
                    to="/staff/child-profile"
                    className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                    activeProps={{
                      className:
                        "group/button flex items-center gap-2 text-kfk-blue hover:text-kfk-blue",
                    }}
                  >
                    <ClipboardCheckIcon className="transition-colors size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Child Profiles
                    </span>
                  </Link>
                </SidebarMenuButtonWithHovering>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Published Gifts">
                <SidebarMenuButtonWithHovering>
                  <Link
                    to="/staff/gifts"
                    className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                    activeProps={{
                      className:
                        "group/button flex items-center gap-2 text-kfk-red hover:text-kfk-red",
                    }}
                  >
                    <GiftIcon className="transition-colors size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Published Gifts
                    </span>
                  </Link>
                </SidebarMenuButtonWithHovering>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            {canAccessAdmin && (
              <>
                <SidebarMenuItem className="flex justify-center">
                  <SidebarMenuButtonWithTooltip label="User Management">
                    <SidebarMenuButtonWithHovering>
                      <Link
                        to="/staff/admin/users"
                        className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                        activeProps={{
                          className:
                            "group/button flex items-center gap-2 text-kfk-green hover:text-kfk-green",
                        }}
                      >
                        <UsersIcon className="transition-colors size-6" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          User Management
                        </span>
                      </Link>
                    </SidebarMenuButtonWithHovering>
                  </SidebarMenuButtonWithTooltip>
                </SidebarMenuItem>
                <SidebarMenuItem className="flex justify-center">
                  <SidebarMenuButtonWithTooltip label="Gift Drives">
                    <SidebarMenuButtonWithHovering>
                      <Link
                        to="/staff/admin/drives"
                        className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                        activeProps={{
                          className:
                            "group/button flex items-center gap-2 text-kfk-blue hover:text-kfk-blue",
                        }}
                      >
                        <CalendarIcon className="transition-colors size-6" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Gift Drives
                        </span>
                      </Link>
                    </SidebarMenuButtonWithHovering>
                  </SidebarMenuButtonWithTooltip>
                </SidebarMenuItem>
                <SidebarMenuItem className="flex justify-center">
                  <SidebarMenuButtonWithTooltip label="Form Links">
                    <SidebarMenuButtonWithHovering>
                      <Link
                        to="/staff/admin/forms"
                        className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                        activeProps={{
                          className:
                            "group/button flex items-center gap-2 text-kfk-green hover:text-kfk-green",
                        }}
                      >
                        <LinkIcon className="transition-colors size-6" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Form Links
                        </span>
                      </Link>
                    </SidebarMenuButtonWithHovering>
                  </SidebarMenuButtonWithTooltip>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-6 py-4 group-data-[collapsible=icon]:px-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center">
            <SidebarMenuButtonWithTooltip label={user.displayName || "User"}>
              <SidebarMenuButtonWithHovering>
                <Link
                  to="/staff/profile"
                  className="group/button flex w-full items-center gap-3 text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 hover:bg-black! hover:text-white active:text-white"
                  activeProps={{
                    className:
                      "group/button flex w-full items-center gap-3 text-left bg-black text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0",
                  }}
                >
                  <UserCircleIcon className="size-8 transition-colors group-data-[collapsible=icon]:size-6" />

                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-base font-medium">
                      {user.displayName || "User Name"}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <Settings className="size-3.5" />
                      Settings
                    </span>
                  </div>
                </Link>
              </SidebarMenuButtonWithHovering>
            </SidebarMenuButtonWithTooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
