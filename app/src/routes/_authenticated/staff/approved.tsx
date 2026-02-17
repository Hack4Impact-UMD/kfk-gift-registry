import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/staff/approved')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/staff/approved"!</div>
}
