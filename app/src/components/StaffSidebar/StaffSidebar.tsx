import { useState } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import KFKLogo from "@/assets/kfk-logo.png";

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
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
} from "@/components/icons";

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

export function StaffSidebar() {
  const { auth } = useRouteContext({ from: "/_authenticated" });
  const user = auth.authUser;
  const [year, setYear] = useState("2026");
  const [, setIsDropdownPressed] = useState<boolean>(false);

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
          className="h-[51px] w-[205px] object-contain opacity-100 group-data-[collapsible=icon]:opacity-0"
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
                  value={year}
                  onValueChange={setYear}
                >
                  <SidebarMenuButtonWithTooltip label={year}>
                    <SelectTrigger
                      chevron={false}
                      className="w-full group/button flex items-center justify-start gap-2 group-data-[collapsible=icon]:min-w-12 min-h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 data-[state=open]:text-[var(--color-kfk-blue)]"
                    >
                      <CalendarIcon className="transition-colors text-black size-6" />

                      <span className="truncate group-data-[collapsible=icon]:hidden group-data-[status=active]/button:text-[var(--color-kfk-blue)]">
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                  </SidebarMenuButtonWithTooltip>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
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
              <SidebarMenuButtonWithTooltip label="Profile Approval">
                <SidebarMenuButtonWithHovering>
                  <Link
                    to="/staff/pending"
                    className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                    activeProps={{
                      className:
                        "group/button flex items-center gap-2 text-kfk-yellow hover:text-kfk-yellow",
                    }}
                  >
                    {/* Placeholder Link */}
                    <ClipboardIcon className="transition-colors size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Profile Approval
                    </span>
                  </Link>
                </SidebarMenuButtonWithHovering>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Approved Profiles">
                <SidebarMenuButtonWithHovering>
                  <Link
                    to="/staff/approved"
                    className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                    activeProps={{
                      className:
                        "group/button flex items-center gap-2 text-kfk-blue hover:text-kfk-blue",
                    }}
                  >
                    <ClipboardCheckIcon className="transition-colors size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Approved Profiles
                    </span>
                  </Link>
                </SidebarMenuButtonWithHovering>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
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
                    {" "}
                    {/* Placeholder Link */}
                    <UsersIcon className="transition-colors size-6" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      User Management
                    </span>
                  </Link>
                </SidebarMenuButtonWithHovering>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-6 py-4">
        <SidebarMenuButtonWithTooltip label={user.displayName || "User"}>
          <SidebarMenuButtonWithHovering>
            <Link
              to="/staff/profile"
              className="group/button flex items-center gap-3 w-full text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 hover:!bg-black hover:text-white active:text-white"
              activeProps={{
                className:
                  "group/button flex items-center gap-3 w-full text-left bg-black text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0",
              }}
            >
              <UserCircleIcon className="transition-colors size-8" />

              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-base font-medium">
                  {user.displayName || "User Name"}
                </span>
                <span className={`text-sm`}>{user.role}</span>
              </div>
            </Link>
          </SidebarMenuButtonWithHovering>
        </SidebarMenuButtonWithTooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
