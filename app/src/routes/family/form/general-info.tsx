import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/family/form/general-info')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/family/form/general-info"!</div>
}
