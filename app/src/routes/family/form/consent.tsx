import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/family/form/consent')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/family/form/consent"!</div>
}
