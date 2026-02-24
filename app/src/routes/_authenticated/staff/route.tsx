import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { HamburgerIcon, MenuIcon, XIcon } from 'lucide-react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { StaffSidebar } from '@/components/StaffSidebar/StaffSidebar'

export const Route = createFileRoute('/_authenticated/staff')({
  component: RouteComponent,
})

function RouteComponent() {
  const [open, setOpen] = useState(true)

  return <div>
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div className="flex flex-row w-full h-full">
        <StaffSidebar />
        <main className="flex-1 w-full">
          <div className='w-full bg-accent border-b block md:hidden'>
            <SidebarTrigger openIcon={<XIcon />} closeIcon={<MenuIcon />}>
            </SidebarTrigger>
          </div>
          <div className='p-4'>
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  </div>
}
