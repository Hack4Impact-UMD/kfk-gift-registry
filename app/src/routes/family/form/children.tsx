import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/family/form/children')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/family/form/children"!</div>
}
