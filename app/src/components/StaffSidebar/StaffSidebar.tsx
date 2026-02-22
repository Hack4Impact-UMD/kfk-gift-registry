import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue,
} from "@/components/ui/select"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger, 
} from "@/components/ui/popover"


import { Link, useRouteContext } from '@tanstack/react-router'
import { logout } from "@/services/authService"
import { useState } from "react"
import KFKLogo from "@/assets/kfk-logo.png"
import CurrentYearIcon from "@/assets/staff-sidebar/current-year-icon.png"
import HomeIcon from "@/assets/staff-sidebar/home-icon.png"
import ProfileApprovalIcon from "@/assets/staff-sidebar/profile-approval-icon.png"
import ApprovedProfilesIcon from "@/assets/staff-sidebar/approved-profiles-icon.png"
import UserManagementIcon from "@/assets/staff-sidebar/user-management-icon.png"
import UserIcon from "@/assets/staff-sidebar/user-icon.png"
import CloseSidebarIcon from "@/assets/staff-sidebar/close-sidebar-icon.png" 
import OpenSidebarIcon from "@/assets/staff-sidebar/open-sidebar-icon.png"

function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar()

  return (
    <SidebarTrigger onClick={toggleSidebar} className="absolute top-4 right-4">
      <button className="absolute top-4 right-4">
        <img
            src={state === "expanded" ? CloseSidebarIcon : OpenSidebarIcon}
            alt={state === "expanded" ? "Close" : "Open"}
            className="h-8 w-8"
        />
      </button>
    </SidebarTrigger>
  )
}

// Tooltip wrapper for sidebar menu items to show labels only when collapsed
function SidebarMenuButtonWithTooltip({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {isCollapsed ? (
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      ) : (
        <TooltipContent side="right" className="hidden">
          {label}
        </TooltipContent>
      )}
    </Tooltip>
  )
}
 
export function StaffSidebar() {
  const { auth } = useRouteContext({ from: "/_authenticated/staff" })
  const user = auth?.authUser
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const [year, setYear] = useState("2026")

  return (
    <Sidebar collapsible="icon" className="duration-200">
      <SidebarToggle />
      <SidebarHeader className="border-b px-4 py-8 flex flex-col items-center gap-[15px]">
        <img 
          src={KFKLogo} 
          alt="Kisses For Kyle" 
          className="h-[51px] w-[205px] object-contain opacity-100 group-data-[collapsible=icon]:opacity-0" 
        />

        <div className="bg-black text-white flex items-center justify-center w-[205px] h-[48px] rounded-[10px] gap-[8px]
                 opacity-100 group-data-[collapsible=icon]:opacity-0">
            <span className="text-lg font-semibold text-center">Gift Registry</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="flex-col gap-2">
            <SidebarMenuItem className="flex group-data-[collapsible=icon]:justify-center">
              <SidebarMenuButton asChild size="lg">
                <Select value={year} onValueChange={setYear}>
                  <SidebarMenuButtonWithTooltip label={year}>
                    <SelectTrigger className="w-full flex items-center justify-start gap-2 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 [&>svg]:group-data-[state=collapsed]:hidden">
                      <img
                        src={CurrentYearIcon}
                        className="h-8 w-8 shrink-0"
                        alt="Logo"
                      />

                      <span className="truncate group-data-[collapsible=icon]:hidden">
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
                <SidebarMenuButton asChild size="lg" className="transition hover:text-red-500">
                    <Link to="/staff/home" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                        <img src={HomeIcon} alt="" className="h-8 w-8" />
                        <span className="group-data-[collapsible=icon]:hidden">Home</span>

                    </Link>
                </SidebarMenuButton>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Profile Approval">
                <SidebarMenuButton size="lg" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center hover:text-yellow-500">
                    <img src={ProfileApprovalIcon} alt="" className="h-8 w-8" />
                    <span className="group-data-[collapsible=icon]:hidden">Profile Approval</span>

                </SidebarMenuButton>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Approved Profiles">
                    <SidebarMenuButton asChild size="lg" className="transition hover:text-green-500">
                        <Link to="/staff/approved" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                            <img src={ApprovedProfilesIcon} alt="" className="h-8 w-8" />
                            <span className="group-data-[collapsible=icon]:hidden">Approved Profiles</span>

                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="User Management">
                <SidebarMenuButton size="lg" className="flex items-center gap-2 justify-start group-data-[collapsible=icon]:justify-center transition hover:text-blue-800">
                    <img src={UserManagementIcon} alt="" className="h-8 w-8" />
                    <span className="group-data-[collapsible=icon]:hidden">User Management</span>
                        
                </SidebarMenuButton>
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-6 py-4">
        <Popover>
          <SidebarMenuButtonWithTooltip label={user?.displayName || "User"}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left">
                <img
                  src={UserIcon}
                  alt="User Avatar"
                  className="h-8 w-8 flex-shrink-0"
                />

                <div className="flex flex-col opacity-100 group-data-[collapsible=icon]:hidden">
                  <span className="text-md font-medium">
                    {user?.displayName || "User Name"}
                  </span>
                  <span className="text-sm text-gray-400">
                    {user?.role}
                  </span>
                </div>
              </button>
            </PopoverTrigger>
          </SidebarMenuButtonWithTooltip>

          <PopoverContent side={collapsed ? "right" : "top"} align="center" className="w-40">
            <button
              onClick={async () => {
                await logout()
                window.location.reload()
              }}
              className="w-full text-left text-sm hover:bg-muted px-2 py-1 rounded"
            >
              Logout
            </button>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  )
}