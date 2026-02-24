import { useState } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { logout } from "@/services/authService.client";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

const SidebarIcon = ({
  isPressed,
  xmlns,
  pressedColor,
  d,
  size = 6,
}: {
  isPressed: boolean;
  xmlns: string;
  pressedColor: string;
  d: string;
  size?: number | string;
}) => {
  return (
    <div className="relative">
      <svg
        xmlns={xmlns}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`${size} transition-text duration-500 ease-in-out ${isPressed ? pressedColor : "text-gray-500 group-hover/button:text-black"} size-${size}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </div>
  );
};

const SidebarMenuButtonWithHovering = ({
  link,
  xmlns,
  label,
  color,
  d,
}: {
  link: string;
  xmlns: string;
  label: string;
  color: string;
  d: string;
}) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  return (
    <SidebarMenuButton
      asChild
      size={"lg"}
      onMouseDown={() => setIsPressed(true)}
      onMouseLeave={() => setIsPressed(false)}
      isActive={isPressed}
      className={
        "group/button transition min-h-12 min-w-12 flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
      }
    >
      <Link
        to={link}
        className="group/button flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
      >
        <SidebarIcon
          isPressed={isPressed}
          xmlns={xmlns}
          pressedColor={color}
          d={d}
        />
        <span
          className={`group-data-[collapsible=icon]:hidden transition-text duration-500 ease-in-out ${isPressed ? color : ""}`}
        >
          {label}
        </span>
      </Link>
    </SidebarMenuButton>
  );
};

export function StaffSidebar() {
  const { auth } = useRouteContext({ from: "/_authenticated/staff" });
  const user = auth?.authUser;
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [year, setYear] = useState("2026");
  const [isDropdownPressed, setIsDropdownPressed] = useState<boolean>(false);

  return (
    <Sidebar collapsible="icon" className="duration-200">
      <SidebarTrigger
        openIcon={
          <SidebarIcon
            isPressed={false}
            xmlns="http://www.w3.org/2000/svg"
            pressedColor="text-gray-700" // optional
            d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
          />
        }
        closeIcon={
          <SidebarIcon
            isPressed={false}
            xmlns="http://www.w3.org/2000/svg"
            pressedColor="text-gray-700" // optional
            d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
          />
        }
        className="absolute top-4 right-4 rounded transition-colors duration-200"
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
                    <SelectTrigger className="w-full group/button flex items-center justify-start gap-2 group-data-[collapsible=icon]:min-w-12 min-h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 [&>svg]:group-data-[collapsible=icon]:hidden">
                      <SidebarIcon
                        isPressed={isDropdownPressed}
                        xmlns="http://www.w3.org/2000/svg"
                        pressedColor="text-[var(--color-kfk-blue)]"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
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
                <SidebarMenuButtonWithHovering
                  link={"/staff/home"}
                  label="Home"
                  color="text-[var(--color-kfk-red)]"
                  xmlns="http://www.w3.org/2000/svg"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Profile Approval">
                <SidebarMenuButtonWithHovering
                  link="/staff/home" // Placeholder link
                  xmlns="http://www.w3.org/2000/svg"
                  label="Profile Approval"
                  color="text-[var(--color-kfk-yellow)]"
                  d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"
                />
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="Approved Profiles">
                <SidebarMenuButtonWithHovering
                  link="/staff/approved"
                  xmlns="http://www.w3.org/2000/svg"
                  label="Approved Profiles"
                  color="text-[var(--color-kfk-blue)]"
                  d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                />
              </SidebarMenuButtonWithTooltip>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex justify-center">
              <SidebarMenuButtonWithTooltip label="User Management">
                <SidebarMenuButtonWithHovering
                  link="/staff/home" // Placeholder link
                  xmlns="http://www.w3.org/2000/svg"
                  label="User Management"
                  color="text-[var(--color-kfk-green)]"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
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
                <SidebarIcon
                  isPressed={true}
                  xmlns="http://www.w3.org/2000/svg"
                  pressedColor="text-gray-700" // optional pressed color
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  size={10}
                />

                <div className="flex flex-col opacity-100 group-data-[collapsible=icon]:hidden">
                  <span className="text-md font-medium">
                    {user?.displayName || "User Name"}
                  </span>
                  <span className="text-sm text-gray-400">{user?.role}</span>
                </div>
              </button>
            </PopoverTrigger>
          </SidebarMenuButtonWithTooltip>

          <PopoverContent
            side={collapsed ? "right" : "top"}
            align="center"
            className="w-40"
          >
            <button
              onClick={async () => {
                await logout();
                window.location.reload();
              }}
              className="w-full text-left text-sm hover:bg-muted px-2 py-1 rounded"
            >
              Logout
            </button>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  );
}
