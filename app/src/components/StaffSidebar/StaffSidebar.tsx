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

import '../../styles.css'

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
import CurrentYearIconHovered from "@/assets/staff-sidebar/current-year-icon-hovered.png"
import CurrentYearIconPressed from "@/assets/staff-sidebar/current-year-icon-pressed.png"
import HomeIcon from "@/assets/staff-sidebar/home-icon.png"
import HomeIconHovered from "@/assets/staff-sidebar/home-icon-hovered.png"
import HomeIconPressed from "@/assets/staff-sidebar/home-icon-pressed.png"
import ProfileApprovalIcon from "@/assets/staff-sidebar/profile-approval-icon.png"
import ProfileApprovalIconHovered from "@/assets/staff-sidebar/profile-approval-icon-hovered.png"
import ProfileApprovalIconPressed from "@/assets/staff-sidebar/profile-approval-icon-pressed.png"
import ApprovedProfilesIcon from "@/assets/staff-sidebar/approved-profiles-icon.png"
import ApprovedProfilesIconHovered from "@/assets/staff-sidebar/approved-profiles-icon-hovered.png"
import ApprovedProfilesIconPressed from "@/assets/staff-sidebar/approved-profiles-icon-pressed.png"
import UserManagementIcon from "@/assets/staff-sidebar/user-management-icon.png"
import UserManagementIconHovered from "@/assets/staff-sidebar/user-management-icon-hovered.png"
import UserManagementIconPressed from "@/assets/staff-sidebar/user-management-icon-pressed.png"
import UserIcon from "@/assets/staff-sidebar/user-icon.png"
import CloseSidebarIcon from "@/assets/staff-sidebar/close-sidebar-icon.png" 
import OpenSidebarIcon from "@/assets/staff-sidebar/open-sidebar-icon.png"

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

  if (!isCollapsed) return children

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex">{children}</div>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

const SidebarIcon = ({
  isPressed,
  defaultSrc,
  hoverSrc,
  pressedSrc,
  alt
}: {
  isPressed:boolean,
  defaultSrc:string,
  hoverSrc:string,
  pressedSrc:string,
  alt:string
}) => {
  return (
<div className="relative h-8 w-8">
    <img 
      src={defaultSrc} 
      alt={alt}
      className="absolute h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover/button:opacity-0"
    />
    <img 
      src={hoverSrc}
      alt={alt}
      className={`absolute opacity-0 inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${isPressed ? 'group-hover/button:opacity-0' :'group-hover/button:opacity-80'}`}
    />
    <img 
      src={pressedSrc}
      alt={alt}
      className={`absolute opacity-0 inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${isPressed ? 'opacity-100' : 'opacity-0'}`}
    />
  </div>
  )
}

const SidebarMenuButtonWithHovering = ({
  link,
  defaultSrc,
  hoverSrc,
  pressedSrc,
  label,
  alt,
  color,
}: {
  link:string,
  defaultSrc:string,
  hoverSrc:string,
  pressedSrc:string,
  label:string,
  alt:string,
  color:string
}) => {
  const [isPressed, setIsPressed] = useState<boolean>(false) 

  return (
  <SidebarMenuButton
      asChild
      size={"lg"}
      onMouseDown={() => setIsPressed(true)}
      onMouseLeave={() => setIsPressed(false)}
      isActive={isPressed} 
      className={'group/button transition min-h-12 min-w-12 flex items-center gap-2 group-data-[collapsible=icon]:justify-center'}
    >
      <Link to={link} className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <SidebarIcon 
          isPressed={isPressed} defaultSrc={defaultSrc} hoverSrc={hoverSrc} pressedSrc={pressedSrc} alt={alt}
          />
          <span className={`group-data-[collapsible=icon]:hidden transition-text duration-150 ease-in-out ${isPressed && color}`}>{label}</span>

      </Link>
    </SidebarMenuButton>
)}
 
export function StaffSidebar() {
  const { auth } = useRouteContext({ from: "/_authenticated/staff" })
  const user = auth?.authUser
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const [year, setYear] = useState("2026")
  const [isDropdownPressed, setIsDropdownPressed] = useState<boolean>(false);

  return (
    <Sidebar collapsible="icon" className="duration-200">
      <SidebarTrigger
        openIcon={<img src={OpenSidebarIcon} alt="Open" />}
        closeIcon={<img src={CloseSidebarIcon} alt="Close" />}
        className="absolute top-4 right-4 rounded transition-colors duration-200"
      />
      <SidebarHeader className="border-b px-4 py-8 mt-4 flex flex-col items-center gap-[15px]">
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
                <Select onOpenChange={setIsDropdownPressed} value={year} onValueChange={setYear}>
                  <SidebarMenuButtonWithTooltip label={year}>
                    <SelectTrigger 
                      className="w-full group/button flex items-center justify-start gap-2 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 [&>svg]:group-data-[state=collapsed]:hidden"
                    >
                      <SidebarIcon 
                        isPressed={isDropdownPressed}
                        defaultSrc={CurrentYearIcon}
                        hoverSrc={CurrentYearIconHovered}
                        pressedSrc={CurrentYearIconPressed}
                        alt=""/>

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
                <SidebarMenuButtonWithHovering
                  link={"/staff/home"}
                  defaultSrc={HomeIcon} 
                  hoverSrc={HomeIconHovered}
                  pressedSrc={HomeIconPressed}
                  label="Home"
                  alt=""
                  color="text-[var(--color-kfk-red)]"
                 />

              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Profile Approval">
                <SidebarMenuButtonWithHovering
                  link=""
                  defaultSrc={ProfileApprovalIcon} 
                  hoverSrc={ProfileApprovalIconHovered}
                  pressedSrc={ProfileApprovalIconPressed}
                  label="Profile Approval"
                  alt=""
                  color="text-[var(--color-kfk-yellow)]"
                 />

              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Approved Profiles">
                  <SidebarMenuButtonWithHovering
                    link="/staff/approved"
                    defaultSrc={ApprovedProfilesIcon} 
                    hoverSrc={ApprovedProfilesIconHovered}
                    pressedSrc={ApprovedProfilesIconPressed}
                    label="Approved Profiles"
                    alt=""
                    color="text-[var(--color-kfk-blue)]"
                  />

                </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="User Management">
                <SidebarMenuButtonWithHovering
                  link=""
                  defaultSrc={UserManagementIcon} 
                  hoverSrc={UserManagementIconHovered}
                  pressedSrc={UserManagementIconPressed}
                  label="User Management"
                  alt=""
                  color="text-[var(--color-kfk-green)]"
                 />

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