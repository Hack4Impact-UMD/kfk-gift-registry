import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/staff/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/staff/admin"!</div>
}
