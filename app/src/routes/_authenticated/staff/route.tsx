import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { StaffSidebar } from '@/components/StaffSidebar/StaffSidebar'
import React from "react"

export const Route = createFileRoute('/_authenticated/staff')({
  component: RouteComponent,
})

function RouteComponent() {
  const [open, setOpen] = React.useState(true)
  return <div>
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div className="flex min-h-screen">
        <StaffSidebar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  </div>
}
