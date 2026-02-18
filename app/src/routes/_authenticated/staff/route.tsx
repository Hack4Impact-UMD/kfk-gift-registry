import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { StaffSidebar } from '@/components/StaffSidebar/StaffSidebar'

export const Route = createFileRoute('/_authenticated/staff')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <SidebarProvider>
      <div className="flex min-h-screen">
        <StaffSidebar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  </div>
}
