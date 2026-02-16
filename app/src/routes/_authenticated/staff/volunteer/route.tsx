import { createFileRoute } from '@tanstack/react-router'

// TODO: Add role check on beforeLoad to ensure only volunteers can access these routes
export const Route = createFileRoute('/_authenticated/staff/volunteer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/staff/volunteer"!</div>
}
