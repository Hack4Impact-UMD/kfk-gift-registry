import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
} from "@/components/ui/sidebar"
 
export function StaffSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-6">
        <div className="flex items-center gap-3">
          <img src="assets/kfk-logo.png" alt="Kisses For Kyle" className="h-8 w-8" />
          
            <span className="text-lg font-semibold">
              Gift Registry
            </span>
            
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
            <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                Current Year
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                Home
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                Profile Approval
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                Approved Profiles
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                User Management
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}