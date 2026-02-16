import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/staff')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <p>navbar goes here</p>
    <Outlet />
  </div>
}
